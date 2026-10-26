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
import { ApiProblem, CHECKLIST_API, ChecklistTask } from '@giddy/api';
import {
  AlertComponent,
  ButtonComponent,
  ChoiceComponent,
  DialogComponent,
  ErrorMessage,
  ErrorSummaryComponent,
  FormFieldComponent,
  InputDirective,
} from '@giddy/components';
import { formatDate } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { TaskDialogData } from './task-dialog-data';

type Field = 'title' | 'due' | 'ownerId';
const fieldOrder: Field[] = ['title', 'due', 'ownerId'];
const dayMs = 86_400_000;

/** Adds or changes a checklist task: what, when, who, and a reminder the day before. */
@Component({
  imports: [
    AlertComponent,
    ButtonComponent,
    ChoiceComponent,
    DialogComponent,
    ErrorSummaryComponent,
    FormFieldComponent,
    InputDirective,
  ],
  templateUrl: './task-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDialog {
  private readonly api = inject(CHECKLIST_API);
  private readonly dialogRef = inject<DialogRef<ChecklistTask>>(DialogRef);
  private readonly summary = viewChild(ErrorSummaryComponent);
  protected readonly data = inject<TaskDialogData>(DIALOG_DATA);
  protected readonly editing = !!this.data.task;
  protected readonly title = signal(this.data.task?.title ?? '');
  protected readonly due = signal(this.data.task?.due ?? '');
  protected readonly ownerId = signal(
    this.data.task?.ownerId ?? this.data.planners.find((p) => p.isYou)?.parentId ?? '',
  );
  protected readonly remindMe = signal(this.data.task?.remindMe ?? true);
  protected readonly busy = signal(false);
  protected readonly problem = signal<string | null>(null);
  protected readonly errors = signal<Partial<Record<Field, string>>>({});
  protected readonly summaryErrors = computed<ErrorMessage[]>(() =>
    fieldOrder
      .filter((f) => this.errors()[f])
      .map((f) => ({ targetId: `task-${f}`, message: this.errors()[f]! })),
  );
  /** "Thu 12 Nov, 2 days before the party". */
  protected readonly dueHint = computed(() => {
    const due = this.due();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) return 'On or before the party';
    const days = Math.round(
      (Date.parse(`${this.data.partyDate}T12:00:00Z`) - Date.parse(`${due}T12:00:00Z`)) / dayMs,
    );
    const when =
      days === 0
        ? 'the party day'
        : days === 1
          ? 'the day before the party'
          : days > 1
            ? `${days} days before the party`
            : 'after the party';
    return `${formatDate(due)}, ${when}`;
  });
  protected readonly owners = computed(() =>
    this.data.planners.map((p) => ({
      id: p.parentId,
      label: p.isYou ? `${firstName(p.name)} (me)` : firstName(p.name),
    })),
  );

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected async save(): Promise<void> {
    if (!this.validate()) {
      queueMicrotask(() => this.summary()?.focus());
      return;
    }

    const input = {
      title: this.title().trim(),
      due: this.due(),
      ownerId: this.ownerId() || null,
      remindMe: this.remindMe(),
    };
    this.busy.set(true);
    this.problem.set(null);
    try {
      this.dialogRef.close(
        await firstValueFrom(
          this.data.task
            ? this.api.change(this.data.partyId, this.data.task.id, input)
            : this.api.add(this.data.partyId, input),
        ),
      );
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

  private validate(): boolean {
    const errors: Partial<Record<Field, string>> = {};
    if (!this.title().trim()) errors.title = 'Say what needs doing';
    if (!this.due()) errors.due = 'Choose the date it’s due';
    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }
}

function firstName(name: string): string {
  return name.split(' ')[0];
}
