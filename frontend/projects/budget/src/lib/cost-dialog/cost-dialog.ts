import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ApiProblem, BUDGET_API } from '@giddy/api';
import {
  AlertComponent,
  ButtonComponent,
  ChoiceComponent,
  DialogComponent,
  ErrorMessage,
  ErrorSummaryComponent,
  FormFieldComponent,
  InputDirective,
  InputGroupComponent,
} from '@giddy/components';
import { GiddyMoneyPipe, formatMoney } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { costCategories } from './cost-categories';
import { CostDialogData } from './cost-dialog-data';
import { CostDialogResult } from './cost-dialog-result';

type Field = 'description' | 'category' | 'amount';
const fieldOrder: Field[] = ['description', 'category', 'amount'];
const amountMessage = 'Enter an amount like 35 or 35.50';

/** Adds or changes one of the parent's own costs, previewing what is left before saving. */
@Component({
  imports: [
    AlertComponent,
    ButtonComponent,
    ChoiceComponent,
    DialogComponent,
    ErrorSummaryComponent,
    FormFieldComponent,
    InputDirective,
    InputGroupComponent,
    GiddyMoneyPipe,
  ],
  templateUrl: './cost-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostDialog {
  private readonly api = inject(BUDGET_API);
  private readonly dialogRef = inject<DialogRef<CostDialogResult>>(DialogRef);
  private readonly summary = viewChild(ErrorSummaryComponent);
  protected readonly data = inject<CostDialogData>(DIALOG_DATA);
  protected readonly categories = costCategories;
  protected readonly editing = !!this.data.cost;
  protected readonly description = signal(this.data.cost?.name ?? '');
  protected readonly category = signal(this.data.cost?.category ?? costCategories[0]);
  protected readonly amount = signal(this.data.cost ? String(this.data.cost.planned) : '');
  protected readonly paid = signal(this.data.cost?.status === 'paid');
  protected readonly busy = signal(false);
  protected readonly problem = signal<string | null>(null);
  protected readonly errors = signal<Partial<Record<Field, string>>>({});
  protected readonly summaryErrors = computed<ErrorMessage[]>(() =>
    fieldOrder
      .filter((f) => this.errors()[f])
      .map((f) => ({ targetId: `cost-${f}`, message: this.errors()[f]! })),
  );
  /** "After this you'll have $0 left of your $800 budget." Updates as the parent types. */
  protected readonly preview = computed(() => {
    const budget = this.data.budget;
    if (budget === null) return null;
    const entered = parseAmount(this.amount()) ?? 0;
    const left = budget - (this.data.planned - (this.data.cost?.planned ?? 0) + entered);
    return left >= 0
      ? { lead: 'After this you’ll have ', figure: `${formatMoney(left)} left`, budget }
      : { lead: 'After this you’ll be ', figure: `${formatMoney(-left)} over`, budget };
  });

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected async save(): Promise<void> {
    if (!this.validate()) {
      queueMicrotask(() => this.summary()?.focus());
      return;
    }

    const cost = {
      description: this.description().trim(),
      category: this.category(),
      amount: parseAmount(this.amount())!,
      paid: this.paid(),
    };
    this.busy.set(true);
    this.problem.set(null);
    try {
      const line = await firstValueFrom(
        this.data.cost
          ? this.api.changeCost(this.data.partyId, this.data.cost.id, cost)
          : this.api.addCost(this.data.partyId, cost),
      );
      this.dialogRef.close({ outcome: this.data.cost ? 'changed' : 'added', name: line.name });
    } catch (error) {
      const problem =
        error instanceof HttpErrorResponse ? (error.error as ApiProblem | null) : null;
      if (error instanceof HttpErrorResponse && error.status === 400 && problem?.errors) {
        this.errors.set(
          Object.fromEntries(
            fieldOrder.map((f) => [f, problem.errors![f]?.[0]]).filter(([, m]) => m),
          ),
        );
        queueMicrotask(() => this.summary()?.focus());
      } else {
        this.problem.set('Nothing was saved. Try again in a moment.');
      }
    } finally {
      this.busy.set(false);
    }
  }

  protected async remove(): Promise<void> {
    const cost = this.data.cost!;
    this.busy.set(true);
    this.problem.set(null);
    try {
      await firstValueFrom(this.api.removeCost(this.data.partyId, cost.id));
      this.dialogRef.close({ outcome: 'removed', name: cost.name });
    } catch {
      this.problem.set('The cost is still in the budget. Try again in a moment.');
    } finally {
      this.busy.set(false);
    }
  }

  private validate(): boolean {
    const errors: Partial<Record<Field, string>> = {};
    if (!this.description().trim()) errors.description = 'Say what the cost is for';
    if (parseAmount(this.amount()) === null) errors.amount = amountMessage;
    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }
}

/** A positive amount with at most two decimals, or null. */
function parseAmount(text: string): number | null {
  const trimmed = text.trim().replace(/^\$/, '');
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const amount = Number(trimmed);
  return amount > 0 ? amount : null;
}
