import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BOOKINGS_API } from '@giddy/api';
import { AlertComponent, ButtonComponent, DialogComponent } from '@giddy/components';
import { formatDate, formatMoney, formatTime, formatTimeRange } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { CancelBookingData } from './cancel-booking-data';
import { CancelBookingOutcome } from './cancel-booking-outcome';

/**
 * Confirms cancelling a booking, saying first whether the deposit is refunded or kept. Keep
 * booking is focused. Closes with the outcome; a failure is reported by the page.
 */
@Component({
  imports: [AlertComponent, ButtonComponent, DialogComponent],
  templateUrl: './cancel-booking-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CancelBookingDialog {
  private readonly api = inject(BOOKINGS_API);
  private readonly dialogRef = inject<DialogRef<CancelBookingOutcome>>(DialogRef);
  protected readonly data = inject<CancelBookingData>(DIALOG_DATA);
  protected readonly booking = this.data.booking;
  protected readonly busy = signal(false);
  protected readonly deposit = formatMoney(this.booking.deposit);
  protected readonly card = this.booking.card
    ? `${this.booking.card.brand} ending ${this.booking.card.last4}`
    : 'your card';
  protected readonly description = `${formatDate(this.booking.date)}, ${formatTimeRange(this.booking.start, this.booking.end)} · confirmation ${this.booking.confirmationNumber}`;
  protected readonly startTime = formatTime(this.booking.start);
  protected readonly freeUntil = formatDate(this.booking.freeCancellationUntil);

  protected keep(): void {
    this.dialogRef.close();
  }

  protected async cancel(): Promise<void> {
    this.busy.set(true);
    try {
      this.dialogRef.close(
        await firstValueFrom(this.api.cancel(this.data.partyId, this.booking.id)),
      );
    } catch {
      this.dialogRef.close('failed');
    }
  }
}
