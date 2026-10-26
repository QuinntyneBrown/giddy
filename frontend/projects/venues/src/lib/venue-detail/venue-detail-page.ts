import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { BOOKINGS_API, Booking, PARTIES_API, VENUES_API } from '@giddy/api';
import {
  AlertComponent,
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  DescriptionListComponent,
  EmptyStateComponent,
  FeatureListComponent,
  GalleryComponent,
  GiddyDialog,
  IconComponent,
  IconName,
  RatingComponent,
  SkeletonComponent,
  SlotOption,
  SlotPickerComponent,
  ToastComponent,
  ToastRegionComponent,
} from '@giddy/components';
import {
  ResourceLoader,
  SessionStore,
  formatDate,
  formatMoney,
  formatTime,
  formatTimeRange,
} from '@giddy/core';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { BookVenueData } from '../book-venue-dialog/book-venue-data';
import { BookVenueDialog } from '../book-venue-dialog/book-venue-dialog';
import { CancelBookingData } from '../cancel-booking-dialog/cancel-booking-data';
import { CancelBookingDialog } from '../cancel-booking-dialog/cancel-booking-dialog';
import { CancelBookingOutcome } from '../cancel-booking-dialog/cancel-booking-outcome';
import { pickParty } from '../party-context';
import { duration } from '../venue-format';

/** A venue's details, reviews and its slots on the party date. */
@Component({
  imports: [
    RouterLink,
    AlertComponent,
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    DescriptionListComponent,
    EmptyStateComponent,
    FeatureListComponent,
    GalleryComponent,
    IconComponent,
    RatingComponent,
    SkeletonComponent,
    SlotPickerComponent,
    ToastComponent,
    ToastRegionComponent,
  ],
  templateUrl: './venue-detail-page.html',
  styleUrl: './venue-detail-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VenueDetailPage {
  private readonly api = inject(VENUES_API);
  private readonly router = inject(Router);
  private readonly partiesApi = inject(PARTIES_API);
  private readonly bookingsApi = inject(BOOKINGS_API);
  private readonly dialog = inject(GiddyDialog);
  private readonly session = inject(SessionStore);
  private readonly parties = toSignal(this.partiesApi.mine().pipe(catchError(() => of([]))));

  readonly venueId = input.required<string>();
  /** ISO date to show slots for, from the query string. */
  readonly date = input<string>();
  readonly partyId = input<string>();

  protected readonly party = computed(() => {
    const parties = this.parties();
    return parties ? pickParty(parties, this.partyId()) : null;
  });
  protected readonly day = computed(() => this.date() ?? this.party()?.date ?? '');
  protected readonly venue = new ResourceLoader(
    () => this.api.get(this.venueId(), this.day(), this.party()?.id ?? null),
    () => false,
    false,
  );
  /** Planners can book for the party on its own date. */
  protected readonly canBook = computed(() => {
    const party = this.party();
    return !!party && party.role !== 'viewer' && !party.locked && party.date === this.day();
  });
  protected readonly canPlan = computed(() => {
    const party = this.party();
    return !!party && party.role !== 'viewer' && !party.locked;
  });
  protected readonly opening = signal(false);
  protected readonly toast = signal<{ heading: string; text: string; icon: IconName } | null>(null);
  protected readonly selected = signal<string | null>(null);
  protected readonly favourite = signal(false);
  protected readonly waitlisted = signal(false);

  protected readonly breadcrumb = computed(() => [
    { label: 'Venues', link: '/venues' },
    { label: this.venue.value()?.name ?? 'Venue' },
  ]);
  protected readonly slotOptions = computed<SlotOption[]>(() =>
    (this.venue.value()?.slots ?? []).map((slot) => ({
      value: slot.start,
      label: formatTime(slot.start),
      description: `${formatTime(slot.start)} to ${formatTime(slot.end)}`,
      booked: slot.booked,
    })),
  );
  protected readonly selectedRange = computed(() => {
    const slot = this.venue.value()?.slots.find((s) => s.start === this.selected());
    return slot ? formatTimeRange(slot.start, slot.end) : null;
  });
  protected readonly facts = computed(() => {
    const venue = this.venue.value();
    if (!venue) return [];
    const guests = this.party()?.guests;
    return [
      { term: 'Date', detail: formatDate(venue.date, true) },
      ...(guests
        ? [{ term: 'Kids', detail: `${guests} (fits ${venue.capacity})` }]
        : [{ term: 'Fits', detail: `${venue.capacity} kids` }]),
    ];
  });
  protected readonly bookingFacts = computed(() => {
    const booking = this.venue.value()?.booking;
    if (!booking) return [];
    return [
      { term: 'Kids', detail: `Up to ${booking.capacity}` },
      { term: 'Room', detail: booking.room },
      ...(booking.contact ? [{ term: 'Contact', detail: booking.contact }] : []),
    ];
  });
  protected readonly formatDate = formatDate;
  protected readonly formatMoney = formatMoney;
  protected readonly formatTime = formatTime;
  protected readonly formatTimeRange = formatTimeRange;
  protected readonly duration = duration;

  constructor() {
    effect(() => {
      this.venueId();
      if (!this.day() || this.parties() === undefined) return;
      untracked(() => this.venue.reload());
    });
    effect(() => {
      const venue = this.venue.value();
      if (!venue) return;
      untracked(() => {
        this.selected.set(venue.selectedSlot);
        this.favourite.set(venue.favourite);
        this.waitlisted.set(false);
      });
    });
  }

  protected async toggleFavourite(): Promise<void> {
    const next = !this.favourite();
    this.favourite.set(next);
    try {
      await firstValueFrom(this.api.setFavourite(this.venueId(), next));
    } catch {
      this.favourite.set(!next);
    }
  }

  protected async tellMe(): Promise<void> {
    await firstValueFrom(
      this.api.joinWaitlist(this.venueId(), this.day(), this.party()?.id ?? null),
    );
    this.waitlisted.set(true);
  }

  protected async book(resume: Booking | null = null): Promise<void> {
    const venue = this.venue.value();
    const party = this.party();
    const slot = venue?.slots.find((s) => s.start === (resume?.start ?? this.selected()));
    if (!venue || !party || !slot) return;

    this.opening.set(true);
    try {
      const { overview, savedCards } = await firstValueFrom(
        forkJoin({
          overview: this.partiesApi.overview(party.id),
          savedCards: this.bookingsApi.savedCards().pipe(catchError(() => of([]))),
        }),
      );
      const data: BookVenueData = {
        partyId: party.id,
        childName: overview.childName,
        child: overview.childName
          ? `${overview.childName}${overview.turningAge ? `, turning ${overview.turningAge}` : ''}`
          : '',
        bookingName: this.session.session()?.name ?? '',
        allergies: overview.allergies,
        venue,
        slot: { start: slot.start, end: slot.end },
        savedCards,
        resume,
      };
      const ref = this.dialog.open<Booking, BookVenueData, BookVenueDialog>(BookVenueDialog, data);
      ref.closed.subscribe(() => this.venue.reload());
    } finally {
      this.opening.set(false);
    }
  }

  protected cancelBooking(booking: Booking): void {
    const party = this.party();
    if (!party) return;
    this.toast.set(null);
    const ref = this.dialog.open<CancelBookingOutcome, CancelBookingData, CancelBookingDialog>(
      CancelBookingDialog,
      { partyId: party.id, booking },
      { autoFocus: '[data-initial-focus]' },
    );
    ref.closed.subscribe((outcome) => {
      if (!outcome) return;
      if (outcome === 'failed') {
        this.toast.set({
          heading: 'We couldn’t cancel the booking',
          text: 'It’s still booked; try again in a moment.',
          icon: 'alert',
        });
        return;
      }
      const deposit = formatMoney(outcome.amount);
      const card = booking.card
        ? `${booking.card.brand} ending ${booking.card.last4}`
        : 'your card';
      this.toast.set({
        heading: 'Booking cancelled',
        text: outcome.refunded
          ? `The ${deposit} deposit is on its way back to ${card}.`
          : `${booking.venueName} keeps the ${deposit} deposit.`,
        icon: 'check-circle',
      });
      this.venue.reload();
    });
  }

  protected async pickDate(date: string): Promise<void> {
    await this.router.navigate([], { queryParams: { date }, queryParamsHandling: 'merge' });
  }
}
