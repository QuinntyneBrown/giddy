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
import { RouterLink } from '@angular/router';
import { FAMILY_API, PARTIES_API, VENUES_API, VenueResult, VenueSearch } from '@giddy/api';
import {
  ButtonComponent,
  ChipComponent,
  EmptyStateComponent,
  FormFieldComponent,
  IconComponent,
  InputDirective,
  PopColour,
  RatingComponent,
  SkeletonComponent,
  TabNavComponent,
  TileComponent,
  ToastComponent,
  ToastRegionComponent,
} from '@giddy/components';
import { ResourceLoader, addDays, formatDate, formatMoney, torontoToday } from '@giddy/core';
import { catchError, of } from 'rxjs';
import { CompareSelection } from '../compare-selection';
import { pickParty } from '../party-context';
import { duration, freeBadge } from '../venue-format';
import { VenueFilters, sortOptions, sortStorageKey } from './venue-filters';

const priceSteps = [250, 350, 450, 600];

/** Venues free on the party's date near its area, with filters, sort and comparison. */
@Component({
  imports: [
    RouterLink,
    ButtonComponent,
    ChipComponent,
    EmptyStateComponent,
    FormFieldComponent,
    IconComponent,
    InputDirective,
    RatingComponent,
    SkeletonComponent,
    TabNavComponent,
    TileComponent,
    ToastComponent,
    ToastRegionComponent,
  ],
  templateUrl: './venues-page.html',
  styleUrl: './venues-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VenuesPage {
  private readonly venuesApi = inject(VENUES_API);
  private readonly parties = toSignal(
    inject(PARTIES_API)
      .mine()
      .pipe(catchError(() => of([]))),
  );
  private readonly family = toSignal(
    inject(FAMILY_API)
      .get()
      .pipe(catchError(() => of(null))),
  );
  protected readonly selection = inject(CompareSelection);

  /** From the `partyId` query parameter. */
  readonly partyId = input<string>();

  protected readonly tabs = [
    { label: 'Themes', link: '/themes' },
    { label: 'Venues', link: '/venues' },
    { label: 'Fun & food', link: '/vendors' },
  ];
  protected readonly sortOptions = sortOptions;
  protected readonly duration = duration;
  protected readonly freeBadge = freeBadge;
  protected readonly filters = signal<VenueFilters | null>(null);
  protected readonly party = computed(() => {
    const parties = this.parties();
    return parties ? pickParty(parties, this.partyId()) : undefined;
  });

  protected readonly search = new ResourceLoader(
    () => this.venuesApi.search({ ...this.filters()!, partyId: this.party()?.id ?? null }),
    () => false,
    false,
  );

  protected readonly results = computed(() => this.search.value()?.results ?? []);
  protected readonly area = computed(
    () => this.search.value()?.area ?? this.family()?.areaName ?? 'you',
  );
  protected readonly subtitle = computed(() => {
    const filters = this.filters();
    if (!filters || this.search.status() !== 'ready') return '';
    const count = this.results().length;
    return `${count} ${count === 1 ? 'venue' : 'venues'} free on ${formatDate(filters.date)} near ${this.area()}`;
  });
  protected readonly priceOptions = computed(() => {
    const max = this.filters()?.maxPrice;
    return [...new Set([...priceSteps, ...(max ? [max] : [])])].sort((a, b) => a - b);
  });
  protected readonly noResultsHeading = computed(() => {
    const conflicts = this.search.value()?.noResults?.conflicts ?? [];
    return conflicts.length
      ? `No venues ${conflicts.join(' ')}`
      : 'No venues free nearby on that date';
  });
  protected readonly noResultsText = computed(() => {
    const suggestion = this.search.value()?.noResults?.suggestion;
    if (!suggestion) return 'Try another date, or widen the area.';
    return `${suggestion.label} and you’ll see ${suggestion.count} ${suggestion.count === 1 ? 'venue' : 'venues'}.`;
  });
  protected readonly selectionHeading = computed(() => {
    if (this.selection.refused()) return 'You can compare up to 3 venues';
    const count = this.selection.venues().length;
    return `${count} ${count === 1 ? 'venue' : 'venues'} selected`;
  });
  protected readonly selectionText = computed(() => {
    if (this.selection.refused()) return 'Untick one to add another.';
    const names = this.selection.venues().map((v) => v.name);
    return names.length < 2 ? 'Pick one more to compare.' : `${names.join(' and ')}.`;
  });
  protected readonly compareQuery = computed(() => ({
    ids: this.selection.ids().join(','),
    date: this.filters()?.date ?? '',
    ...(this.party() ? { partyId: this.party()!.id } : {}),
  }));

  constructor() {
    effect(() => {
      const party = this.party();
      if (party === undefined || untracked(this.filters)) return;
      this.filters.set({
        date: party?.date ?? addDays(torontoToday(), 14),
        guests: party?.guests ?? 10,
        radiusKm: 10,
        maxPrice: null,
        indoor: false,
        nutFree: false,
        parking: false,
        stepFree: false,
        sort: this.savedSort(),
      });
    });
    effect(() => {
      if (!this.filters()) return;
      untracked(() => this.search.reload());
    });
  }

  protected update(change: Partial<VenueFilters>): void {
    this.filters.update((filters) => (filters ? { ...filters, ...change } : filters));
    if (change.sort) this.saveSort(change.sort);
  }

  protected relax(): void {
    const suggestion = this.search.value()?.noResults?.suggestion;
    if (!suggestion) return;
    const value =
      suggestion.filter === 'maxPrice' || suggestion.filter === 'radiusKm'
        ? Number(suggestion.value)
        : false;
    this.update({ [suggestion.filter]: value } as Partial<VenueFilters>);
  }

  protected clearFilters(): void {
    this.update({
      maxPrice: null,
      indoor: false,
      nutFree: false,
      parking: false,
      stepFree: false,
      radiusKm: 10,
    });
  }

  protected popAt(index: number): PopColour {
    return (['mint', 'sun', 'orange', 'grape', 'pink', 'sky'] as const)[index % 6];
  }

  protected meta(venue: VenueResult): string {
    return `${venue.neighbourhood} · ${venue.distanceKm.toFixed(1)} km · Up to ${venue.capacity} kids · ages ${venue.minAge}–${venue.maxAge}`;
  }

  protected price(venue: VenueResult): string {
    return formatMoney(venue.price);
  }

  protected toggleCompare(venue: VenueResult, event: Event): void {
    const box = event.target as HTMLInputElement;
    if (!this.selection.toggle(venue.id, venue.name, box.checked)) box.checked = false;
  }

  protected numberValue(event: Event): number {
    return Number((event.target as HTMLInputElement).value);
  }

  protected textValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private savedSort(): VenueSearch['sort'] {
    try {
      const saved = sessionStorage.getItem(sortStorageKey);
      return sortOptions.some((o) => o.value === saved) ? (saved as VenueSearch['sort']) : 'best';
    } catch {
      return 'best';
    }
  }

  private saveSort(sort: VenueSearch['sort']): void {
    try {
      sessionStorage.setItem(sortStorageKey, sort);
    } catch {
      // Sorting still works without storage; it just isn't remembered.
    }
  }
}
