import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RatedProvider, WRAP_UP_API } from '@giddy/api';
import {
  AlertComponent,
  ButtonComponent,
  DialogComponent,
  FormFieldComponent,
  InputDirective,
} from '@giddy/components';
import { firstValueFrom } from 'rxjs';
import { ReviewDialogData } from './review-dialog-data';

/** An optional written review to go with the stars the parent gave a venue or vendor. */
@Component({
  imports: [AlertComponent, ButtonComponent, DialogComponent, FormFieldComponent, InputDirective],
  templateUrl: './review-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewDialog {
  private readonly api = inject(WRAP_UP_API);
  private readonly dialogRef = inject<DialogRef<RatedProvider>>(DialogRef);
  protected readonly data = inject<ReviewDialogData>(DIALOG_DATA);
  protected readonly review = signal(this.data.provider.review ?? '');
  protected readonly problem = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly stars = this.data.provider.stars ?? 0;

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected async save(): Promise<void> {
    this.busy.set(true);
    this.problem.set(null);
    try {
      const rated = await firstValueFrom(
        this.api.rate(this.data.partyId, this.data.provider.providerId, {
          stars: this.stars,
          review: this.review().trim() || null,
        }),
      );
      this.dialogRef.close(rated);
    } catch {
      this.problem.set('The review wasn’t saved. Try again in a moment.');
    } finally {
      this.busy.set(false);
    }
  }
}
