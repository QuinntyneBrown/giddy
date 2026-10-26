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
import { PARTIES_API, VENUES_API } from '@giddy/api';
import {
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
  SlotOption,
  SlotPickerComponent,
} from '@giddy/components';
import { ResourceLoader, formatDate, formatMoney, formatTime, formatTimeRange } from '@giddy/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { pickParty } from '../party-context';
import { duration } from '../venue-format';

/** A venue's details, reviews and its slots on the party date. */
@Component({
  imports: [
    RouterLink,
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
  ],
  templateUrl: './venue-detail-page.html',
  styleUrl: './venue-detail-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VenueDetailPage {
  private readonly api = inject(VENUES_API);
  private readonly router = inject(Router);
  private readonly parties = toSignal(
    inject(PARTIES_API)
      .mine()
      .pipe(catchError(() => of([]))),
  );

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
  protected readonly formatDate = formatDate;
  protected readonly formatMoney = formatMoney;
  protected readonly formatTime = formatTime;
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

  protected async pickDate(date: string): Promise<void> {
    await this.router.navigate([], { queryParams: { date }, queryParamsHandling: 'merge' });
  }
}
