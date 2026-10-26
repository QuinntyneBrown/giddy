import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AlternativeSlot,
  ApiProblem,
  BOOKINGS_API,
  Booking,
  BookVenueRequest,
  SANDBOX_TEST_CARDS,
} from '@giddy/api';
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
import {
  GiddyMoneyPipe,
  formatDate,
  formatDateTime,
  formatMoney,
  formatTime,
  formatTimeRange,
} from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { allergyNotes } from './allergy-notes';
import { BookVenueData } from './book-venue-data';

type Step = 'details' | 'taken' | 'authenticate' | 'booked';
type Field = 'bookingName' | 'mobile' | 'child';

const fieldOrder: Field[] = ['bookingName', 'mobile', 'child'];
const newCard = 'new';

/**
 * Booking a venue slot: check the details, pay the deposit, then see the confirmation. Covers a
 * slot taken meanwhile, a card that is declined, a venue that does not confirm, and the bank's
 * 3-D Secure check. Closes with the booking when one was made or is being held.
 */
@Component({
  imports: [
    NgTemplateOutlet,
    RouterLink,
    GiddyMoneyPipe,
    AlertComponent,
    ButtonComponent,
    ChoiceComponent,
    DialogComponent,
    ErrorSummaryComponent,
    FormFieldComponent,
    InputDirective,
  ],
  templateUrl: './book-venue-dialog.html',
  styleUrl: './book-venue-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookVenueDialog {
  private readonly api = inject(BOOKINGS_API);
  private readonly dialogRef = inject<DialogRef<Booking>>(DialogRef);
  private readonly summaryRef = viewChild(ErrorSummaryComponent);
  protected readonly data = inject<BookVenueData>(DIALOG_DATA);
  protected readonly venue = this.data.venue;
  protected readonly testCards = SANDBOX_TEST_CARDS;
  protected readonly newCard = newCard;

  protected readonly step = signal<Step>(this.data.resume ? 'authenticate' : 'details');
  protected readonly busy = signal(false);
  protected readonly slot = signal(this.data.slot);
  protected readonly bookingName = signal(this.data.bookingName);
  protected readonly mobile = signal('');
  protected readonly child = signal(this.data.child);
  protected readonly notes = signal(allergyNotes(this.data.allergies));
  protected readonly card = signal(this.data.savedCards[0]?.id ?? newCard);
  protected readonly testCard = signal(SANDBOX_TEST_CARDS[0].token);
  protected readonly saveCard = signal(true);
  protected readonly errors = signal<Partial<Record<Field, string>>>({});
  protected readonly problem = signal<{ heading: string; text: string } | null>(null);
  protected readonly alternatives = signal<AlternativeSlot[]>([]);
  protected readonly takenStart = signal<string | null>(null);
  protected readonly booking = signal<Booking | null>(this.data.resume);

  protected readonly heading = computed(() =>
    this.step() === 'booked'
      ? 'You’re booked! 🎉'
      : `Book ${this.venue.name}${this.data.childName ? ` for ${this.data.childName}’s party` : ''}`,
  );
  protected readonly description = computed(() => {
    switch (this.step()) {
      case 'booked':
        return `One big thing done${this.data.childName ? ` for ${this.data.childName}’s party` : ''}.`;
      case 'authenticate':
        return 'Your bank wants to check it’s you before the deposit is paid.';
      default:
        return `Check the details, then pay the ${formatMoney(this.venue.deposit)} deposit to hold the room.`;
    }
  });
  protected readonly when = computed(
    () =>
      `${formatDate(this.venue.date, true)} · ${formatTimeRange(this.slot().start, this.slot().end)} · ${this.venue.room} · up to ${this.venue.capacity} kids`,
  );
  protected readonly payLabel = computed(() =>
    this.problem() ? 'Try again' : `Pay ${formatMoney(this.venue.deposit)} and book`,
  );
  protected readonly depositNote = `Pay ${formatMoney(this.venue.deposit)} deposit now, ${formatMoney(this.venue.price - this.venue.deposit)} at the venue`;
  protected readonly cancellationNote = `Free cancellation until ${formatDate(this.venue.freeCancellationUntil)}. After that the deposit is non-refundable.`;
  protected readonly summaryErrors = computed<ErrorMessage[]>(() => {
    const errors = this.errors();
    return fieldOrder
      .filter((field) => errors[field])
      .map((field) => ({ targetId: `bv-${field}`, message: errors[field]! }));
  });
  protected readonly holdNote = computed(() => {
    const booking = this.booking();
    if (!booking) return '';
    const card = booking.card
      ? ` while ${booking.card.brand} ending ${booking.card.last4} is verified`
      : '';
    return `${booking.venueName} is holding ${formatTime(booking.start)} for you until ${formatDateTime(new Date(booking.holdExpiresAt))}${card}.`;
  });
  protected readonly bookedHeadline = computed(() => {
    const booking = this.booking();
    return booking
      ? `${booking.venueName} is booked for ${formatDate(booking.date)}, ${formatTimeRange(booking.start, booking.end)}!`
      : '';
  });
  protected readonly formatTime = formatTime;
  protected readonly formatTimeRange = formatTimeRange;
  protected readonly formatDate = formatDate;

  protected async pay(): Promise<void> {
    if (!this.validate()) {
      queueMicrotask(() => this.summaryRef()?.focus());
      return;
    }

    const savedCardId = this.card() === newCard ? null : this.card();
    const request: BookVenueRequest = {
      venueId: this.venue.id,
      date: this.venue.date,
      start: this.slot().start,
      bookingName: this.bookingName().trim(),
      mobile: this.mobile().trim(),
      child: this.child().trim(),
      notes: this.notes().trim() || null,
      payment: {
        token: savedCardId ? null : this.testCard(),
        savedCardId,
        saveCard: !savedCardId && this.saveCard(),
      },
    };
    await this.run(() => this.api.book(this.data.partyId, request));
  }

  protected async approve(): Promise<void> {
    const booking = this.booking();
    if (booking)
      await this.run(() => this.api.completeAuthentication(this.data.partyId, booking.id));
  }

  protected pickAlternative(slot: AlternativeSlot): void {
    this.slot.set({ start: slot.start, end: slot.end });
    this.problem.set(null);
    this.step.set('details');
  }

  protected close(): void {
    this.dialogRef.close(this.booking() ?? undefined);
  }

  private async run(call: () => ReturnType<typeof this.api.book>): Promise<void> {
    this.busy.set(true);
    this.problem.set(null);
    try {
      const booking = await firstValueFrom(call());
      this.booking.set(booking);
      this.step.set(booking.state === 'holding' ? 'authenticate' : 'booked');
    } catch (error) {
      this.fail(error);
    } finally {
      this.busy.set(false);
    }
  }

  private fail(error: unknown): void {
    const problem = error instanceof HttpErrorResponse ? (error.error as ApiProblem | null) : null;
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    if (status === 409 && problem && 'alternatives' in problem) {
      this.takenStart.set(this.slot().start);
      this.alternatives.set(
        (problem as ApiProblem & { alternatives: AlternativeSlot[] }).alternatives,
      );
      this.step.set('taken');
      return;
    }
    if (status === 400 && problem?.errors) {
      this.errors.set(
        Object.fromEntries(
          fieldOrder.map((f) => [f, problem.errors![f]?.[0]]).filter(([, m]) => m),
        ),
      );
      queueMicrotask(() => this.summaryRef()?.focus());
      return;
    }
    this.booking.set(null);
    this.step.set('details');
    this.problem.set({
      heading: status === 402 ? 'That card didn’t go through' : 'That didn’t go through',
      text:
        status === 402 || status === 502
          ? problem!.title
          : 'We couldn’t finish the booking, so nothing was charged. Try again in a moment.',
    });
  }

  private validate(): boolean {
    const digits = this.mobile().replace(/\D/g, '');
    const errors: Partial<Record<Field, string>> = {};
    if (!this.bookingName().trim()) errors.bookingName = 'Add a name for the booking';
    if (!digits)
      errors.mobile = `Add a mobile number so ${this.venue.name} can reach you on the day`;
    else if (!(digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))))
      errors.mobile = 'Enter a 10-digit mobile number, like 416-555-0188';
    if (!this.child().trim()) errors.child = 'Add the birthday child';
    this.errors.set(errors);
    return Object.keys(errors).length === 0;
  }
}
