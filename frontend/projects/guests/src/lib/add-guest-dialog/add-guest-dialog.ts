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
import { ApiProblem, GUESTS_API, Guest } from '@giddy/api';
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
import { formatDate, isCanadianMobile, isEmail } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { AddGuestData } from './add-guest-data';

type Field = 'childName' | 'parentName' | 'email' | 'mobile';
const fieldOrder: Field[] = ['childName', 'parentName', 'email', 'mobile'];

/** Adds one family, and invites them now if the invitations have already gone out. */
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
  templateUrl: './add-guest-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddGuestDialog {
  private readonly api = inject(GUESTS_API);
  private readonly dialogRef = inject<DialogRef<Guest>>(DialogRef);
  private readonly summary = viewChild(ErrorSummaryComponent);
  protected readonly data = inject<AddGuestData>(DIALOG_DATA);
  protected readonly childName = signal(this.data.childName);
  protected readonly parentName = signal('');
  protected readonly email = signal('');
  protected readonly mobile = signal('');
  protected readonly sendNow = signal(true);
  protected readonly busy = signal(false);
  protected readonly problem = signal<string | null>(null);
  protected readonly errors = signal<Partial<Record<Field, string>>>({});
  protected readonly summaryErrors = computed<ErrorMessage[]>(() =>
    fieldOrder
      .filter((f) => this.errors()[f])
      .map((f) => ({ targetId: `ag-${f}`, message: this.errors()[f]! })),
  );
  protected readonly sendNowNote = computed(() => {
    const first = this.childName().trim().split(' ')[0] || 'They';
    return `Invites already went out on ${formatDate(this.data.invitesSentOn!)}; ${first} gets the same one.`;
  });
  protected readonly inviting = computed(() => !!this.data.invitesSentOn && this.sendNow());

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected async save(): Promise<void> {
    if (!this.validate()) {
      queueMicrotask(() => this.summary()?.focus());
      return;
    }

    this.busy.set(true);
    this.problem.set(null);
    try {
      this.dialogRef.close(
        await firstValueFrom(
          this.api.add(this.data.partyId, {
            childName: this.childName().trim(),
            parentName: this.parentName().trim(),
            email: this.email().trim(),
            mobile: this.mobile().trim() || null,
            sendNow: this.inviting(),
          }),
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
        this.problem.set(
          error instanceof HttpErrorResponse && error.status === 409
            ? problem!.title
            : 'We couldn’t add the guest. Try again in a moment.',
        );
      }
    } finally {
      this.busy.set(false);
    }
  }

  private validate(): boolean {
    const errors: Partial<Record<Field, string>> = {};
    if (!this.childName().trim()) errors.childName = 'Add the child’s name';
    if (!this.parentName().trim()) errors.parentName = 'Add the parent’s name';
    if (!this.email().trim()) errors.email = 'Add the parent’s email';
    else if (!isEmail(this.email())) errors.email = 'Enter an email like name@example.com';
    if (this.mobile().trim() && !isCanadianMobile(this.mobile()))
      errors.mobile = 'Enter a Canadian mobile number, like 416-555-0131, or leave it blank';
    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }
}
