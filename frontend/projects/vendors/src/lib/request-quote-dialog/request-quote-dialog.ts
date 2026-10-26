import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ApiProblem, Quote, VENDORS_API } from '@giddy/api';
import {
  AlertComponent,
  ButtonComponent,
  DialogComponent,
  FormFieldComponent,
  IconComponent,
  InputDirective,
} from '@giddy/components';
import { GiddyMoneyPipe } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { RequestQuoteData } from './request-quote-data';

type Field = 'date' | 'start' | 'kids' | 'location' | 'message';

/** Asks a vendor for a quote with the party's details filled in. Closes with the request. */
@Component({
  imports: [
    AlertComponent,
    ButtonComponent,
    DialogComponent,
    FormFieldComponent,
    IconComponent,
    InputDirective,
    GiddyMoneyPipe,
  ],
  templateUrl: './request-quote-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestQuoteDialog {
  private readonly api = inject(VENDORS_API);
  private readonly dialogRef = inject<DialogRef<Quote>>(DialogRef);
  protected readonly data = inject<RequestQuoteData>(DIALOG_DATA);
  protected readonly date = signal(this.data.date);
  protected readonly start = signal(this.data.start);
  protected readonly kids = signal(this.data.kids);
  protected readonly location = signal(this.data.location);
  protected readonly message = signal(this.data.message);
  protected readonly busy = signal(false);
  protected readonly errors = signal<Partial<Record<Field, string>>>({});
  protected readonly problem = signal<string | null>(null);
  protected readonly sent = signal<Quote | null>(null);

  protected close(): void {
    this.dialogRef.close(this.sent() ?? undefined);
  }

  protected async send(): Promise<void> {
    this.busy.set(true);
    this.problem.set(null);
    this.errors.set({});
    try {
      this.sent.set(
        await firstValueFrom(
          this.api.requestQuote(this.data.partyId, {
            vendorId: this.data.vendor.id,
            date: this.date(),
            start: this.start(),
            kids: Number(this.kids()),
            location: this.location().trim(),
            message: this.message().trim(),
          }),
        ),
      );
    } catch (error) {
      const problem =
        error instanceof HttpErrorResponse ? (error.error as ApiProblem | null) : null;
      if (error instanceof HttpErrorResponse && error.status === 400 && problem?.errors) {
        const fields: Field[] = ['date', 'start', 'kids', 'location', 'message'];
        this.errors.set(
          Object.fromEntries(fields.map((f) => [f, problem.errors![f]?.[0]]).filter(([, m]) => m)),
        );
      } else {
        this.problem.set(
          error instanceof HttpErrorResponse && error.status === 409
            ? problem!.title
            : 'Your request didn’t send. Try again in a moment.',
        );
      }
    } finally {
      this.busy.set(false);
    }
  }
}
