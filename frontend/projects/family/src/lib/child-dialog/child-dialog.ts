import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FAMILY_API } from '@giddy/api';
import {
  AlertComponent,
  ButtonComponent,
  ChoiceCardComponent,
  DialogComponent,
  ErrorMessage,
  ErrorSummaryComponent,
  FormFieldComponent,
  InputDirective,
} from '@giddy/components';
import { formatDate, torontoToday } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { ChildDialogData } from './child-dialog-data';
import { ChildDialogResult } from './child-dialog-result';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiProblem } from '@giddy/api';

type Field = 'firstName' | 'birthday' | 'interests';
const fieldOrder: Field[] = ['firstName', 'birthday', 'interests'];
const maxInterests = 5;

/** Adds or changes a child: name, birthday, up to five interests and any allergies. */
@Component({
  imports: [
    AlertComponent,
    ButtonComponent,
    ChoiceCardComponent,
    DialogComponent,
    ErrorSummaryComponent,
    FormFieldComponent,
    InputDirective,
  ],
  templateUrl: './child-dialog.html',
  styleUrl: './child-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildDialog {
  private readonly api = inject(FAMILY_API);
  private readonly dialogRef = inject<DialogRef<ChildDialogResult>>(DialogRef);
  private readonly summary = viewChild(ErrorSummaryComponent);
  protected readonly data = inject<ChildDialogData>(DIALOG_DATA);
  protected readonly editing = !!this.data.child;
  protected readonly firstName = signal(this.data.child?.firstName ?? '');
  protected readonly birthday = signal(this.data.child?.birthday ?? '');
  protected readonly chosen = signal<string[]>(this.data.child?.interests ?? []);
  protected readonly allergies = signal(this.data.child?.allergies ?? '');
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly limitReached = signal(false);
  protected readonly errors = signal<Partial<Record<Field, string>>>({});
  protected readonly summaryErrors = computed<ErrorMessage[]>(() =>
    fieldOrder
      .filter((f) => this.errors()[f])
      .map((f) => ({ targetId: `child-${f}`, message: this.errors()[f]! })),
  );
  /** "Turns 4 on Wed 3 Feb 2027", as soon as the birthday is a past date. */
  protected readonly turns = computed(() => {
    const birthday = this.birthday();
    const today = torontoToday();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday) || birthday >= today) return null;
    let next = `${today.slice(0, 4)}${birthday.slice(4)}`;
    if (next < today) next = `${Number(today.slice(0, 4)) + 1}${birthday.slice(4)}`;
    return `Turns ${Number(next.slice(0, 4)) - Number(birthday.slice(0, 4))} on ${formatDate(next, true)}`;
  });
  protected readonly saveLabel = computed(() => {
    if (this.failed()) return 'Try again';
    if (this.editing) return 'Save changes';
    const name = this.firstName().trim();
    return name ? `Add ${name}` : 'Add child';
  });

  protected isChosen(name: string): boolean {
    return this.chosen().includes(name);
  }

  protected toggle(name: string, input: HTMLInputElement): void {
    if (input.checked && this.chosen().length >= maxInterests) {
      input.checked = false;
      this.limitReached.set(true);
      return;
    }
    this.limitReached.set(false);
    this.chosen.update((list) =>
      input.checked ? [...list, name] : list.filter((n) => n !== name),
    );
  }

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected async save(): Promise<void> {
    const errors: Partial<Record<Field, string>> = {};
    if (!this.firstName().trim()) errors.firstName = 'Enter your child’s first name';
    if (!this.turns()) errors.birthday = 'Enter a birthday in the past, like 14 Nov 2019';
    this.errors.set(errors);
    if (Object.keys(errors).length) {
      queueMicrotask(() => this.summary()?.focus());
      return;
    }

    const input = {
      firstName: this.firstName().trim(),
      birthday: this.birthday(),
      interests: this.chosen(),
      allergies: this.allergies().trim() || null,
    };
    this.busy.set(true);
    this.failed.set(false);
    try {
      const child = await firstValueFrom(
        this.data.child
          ? this.api.changeChild(this.data.child.id, input)
          : this.api.addChild(input),
      );
      this.dialogRef.close({ child, name: child.firstName });
    } catch (error) {
      const problem =
        error instanceof HttpErrorResponse && error.status === 400
          ? (error.error as ApiProblem | null)
          : null;
      if (problem?.errors) {
        this.errors.set(
          Object.fromEntries(
            fieldOrder.map((f) => [f, problem.errors![f]?.[0]]).filter(([, m]) => m),
          ),
        );
        queueMicrotask(() => this.summary()?.focus());
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(false);
    }
  }

  protected async remove(): Promise<void> {
    const child = this.data.child!;
    this.busy.set(true);
    this.failed.set(false);
    try {
      await firstValueFrom(this.api.removeChild(child.id));
      this.dialogRef.close({ child: null, name: child.firstName });
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
