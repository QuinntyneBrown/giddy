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
import { PARTIES_API, Quote, VENDORS_API, Vendor, VendorCategory } from '@giddy/api';
import {
  AlertComponent,
  ButtonComponent,
  ChipComponent,
  EmptyStateComponent,
  GiddyDialog,
  IconComponent,
  RatingComponent,
  SkeletonComponent,
  TileComponent,
} from '@giddy/components';
import {
  GiddyMoneyPipe,
  ResourceLoader,
  formatDate,
  formatTime,
  ordinal,
  pickParty,
} from '@giddy/core';
import { catchError, of } from 'rxjs';
import { RequestQuoteData } from '../request-quote-dialog/request-quote-data';
import { RequestQuoteDialog } from '../request-quote-dialog/request-quote-dialog';
import { priceCeiling, vendorCategories } from './vendor-chips';
import { allergyFitText, allergyList, planLabel, vendorDetail } from './vendor-text';

const pops = ['sun', 'mint', 'sky', 'pink', 'orange', 'grape'] as const;

/** Fun & food: entertainers, activities, food and cake, and rentals for the party, with quotes. */
@Component({
  imports: [
    AlertComponent,
    ButtonComponent,
    ChipComponent,
    EmptyStateComponent,
    IconComponent,
    RatingComponent,
    SkeletonComponent,
    TileComponent,
    GiddyMoneyPipe,
  ],
  templateUrl: './vendors-page.html',
  styleUrl: './vendors-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorsPage {
  private readonly api = inject(VENDORS_API);
  private readonly partiesApi = inject(PARTIES_API);
  private readonly dialog = inject(GiddyDialog);
  private readonly parties = toSignal(this.partiesApi.mine().pipe(catchError(() => of([]))));

  /** From the query string. */
  readonly category = input<string>();
  readonly partyId = input<string>();

  protected readonly categories = vendorCategories;
  protected readonly priceCeiling = priceCeiling;
  protected readonly chosen = signal<VendorCategory>('entertainers');
  protected readonly themeOn = signal(true);
  protected readonly maxPrice = signal<number | null>(null);

  protected readonly party = computed(() => {
    const parties = this.parties();
    return parties ? pickParty(parties, this.partyId()) : null;
  });
  private readonly overview = new ResourceLoader(
    () => this.partiesApi.overview(this.party()!.id),
    () => false,
    false,
  );
  protected readonly search = new ResourceLoader(
    () => this.api.search(this.party()!.id, this.chosen(), this.themeOn(), this.maxPrice()),
    (result) => result.results.length === 0,
    false,
  );
  protected readonly canPlan = computed(() => {
    const party = this.party();
    return !!party && party.role !== 'viewer' && !party.locked;
  });
  protected readonly subtitle = computed(() => {
    const result = this.search.value();
    if (!result) return '';
    const n = result.results.length;
    const when = formatDate(result.date);
    const place = result.place ?? 'the party';
    switch (result.category) {
      case 'food':
        return `${n} ${n === 1 ? 'bakery or caterer' : 'bakeries and caterers'} that deliver to ${place}`;
      case 'rentals':
        return `${n} ${n === 1 ? 'rental' : 'rentals'} free on ${when} that deliver to ${place}`;
      case 'activities':
        return `${n} ${n === 1 ? 'activity' : 'activities'} free on ${when} that come to ${place}`;
      default:
        return `${n} ${n === 1 ? 'entertainer' : 'entertainers'} free on ${when} who travel to ${place}`;
    }
  });
  protected readonly allergyChildren = computed(() =>
    (this.search.value()?.allergies ?? []).reduce((n, a) => n + Math.max(1, a.children.length), 0),
  );
  protected readonly allergyText = computed(
    () =>
      `Showing allergy info on every food vendor: ${allergyList(this.search.value()?.allergies ?? [])}.`,
  );
  protected readonly emptyHeading = computed(() => {
    const result = this.search.value();
    const noun = vendorCategories.find((c) => c.value === this.chosen())!.noun;
    return `No ${noun} ${result?.noResults?.conflicts.join(' ') ?? 'free that day'}`.trim();
  });

  protected readonly planLabel = planLabel;
  protected readonly allergyFitText = allergyFitText;

  constructor() {
    effect(() => {
      const category = this.category();
      untracked(() => {
        if (category && vendorCategories.some((c) => c.value === category))
          this.chosen.set(category as VendorCategory);
      });
    });
    effect(() => {
      if (!this.party()) return;
      this.chosen();
      this.themeOn();
      this.maxPrice();
      untracked(() => this.search.reload());
    });
    effect(() => {
      if (this.party()) untracked(() => this.overview.reload());
    });
  }

  protected detail(vendor: Vendor): string {
    return vendorDetail(vendor, this.chosen());
  }

  protected pop(index: number) {
    return pops[index % pops.length];
  }

  protected choose(category: VendorCategory): void {
    this.chosen.set(category);
  }

  protected toggleTheme(): void {
    this.themeOn.update((on) => !on);
  }

  protected togglePrice(): void {
    this.maxPrice.update((max) => (max === null ? priceCeiling : null));
  }

  protected suggest(filter: 'maxPrice' | 'theme', value: string): void {
    if (filter === 'theme') this.themeOn.set(false);
    else this.maxPrice.set(Number(value));
  }

  protected requestQuote(vendor: Vendor): void {
    const party = this.party()!;
    const overview = this.overview.value();
    const start = addMinutes(party.startsAt, 75);
    const place = overview?.venueName ?? overview?.area ?? '';
    const child = overview?.childName;
    const occasion = child
      ? `${child}’s ${overview?.turningAge ? ordinal(overview.turningAge) : 'birthday'}`
      : party.name;
    const theme = overview?.theme ? `a ${overview.theme} party` : 'a birthday party';
    const ref = this.dialog.open<Quote, RequestQuoteData, RequestQuoteDialog>(RequestQuoteDialog, {
      partyId: party.id,
      vendor,
      detail: this.detail(vendor),
      date: party.date,
      start,
      kids: overview?.guests ?? party.guests ?? 10,
      location: place,
      message: `Hi! It’s ${occasion}, ${theme}${place ? ` at ${place}` : ''}. Could you come at ${formatTime(start)}?`,
    });
    ref.closed.subscribe((quote) => {
      if (quote) this.search.reload();
    });
  }
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
