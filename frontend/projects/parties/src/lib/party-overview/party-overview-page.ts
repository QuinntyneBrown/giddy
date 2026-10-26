import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PARTIES_API, PartyBooking, PartyMember, PartyTask } from '@giddy/api';
import {
  AlertComponent,
  AllergyTagComponent,
  AvatarComponent,
  BadgeComponent,
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  EmptyStateComponent,
  GiddyDialog,
  IconComponent,
  ListItemComponent,
  MeterComponent,
  MeterSegment,
  PartyHeroComponent,
  PopColour,
  SkeletonComponent,
  StatComponent,
  TallyComponent,
  TaskComponent,
} from '@giddy/components';
import {
  GiddyDatePipe,
  GiddyMoneyPipe,
  GiddyTimeRangePipe,
  ResourceLoader,
  formatDate,
  formatMoney,
  formatRelativeDays,
  formatTimeRange,
  torontoToday,
} from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { DeletePartyData } from '../delete-party-dialog/delete-party-data';
import { DeletePartyDialog } from '../delete-party-dialog/delete-party-dialog';

const categoryArt: Record<string, { emoji: string; pop: PopColour }> = {
  Venue: { emoji: '📍', pop: 'sky' },
  Entertainer: { emoji: '🧪', pop: 'sun' },
  Cake: { emoji: '🎂', pop: 'pink' },
  Food: { emoji: '🍕', pop: 'orange' },
  'Loot bags': { emoji: '🎁', pop: 'mint' },
};

/** A party at a glance: countdown, readiness, bookings, next tasks, guests, budget and planners. */
@Component({
  imports: [
    RouterLink,
    AlertComponent,
    AllergyTagComponent,
    AvatarComponent,
    BadgeComponent,
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    IconComponent,
    ListItemComponent,
    MeterComponent,
    PartyHeroComponent,
    SkeletonComponent,
    StatComponent,
    TallyComponent,
    TaskComponent,
    GiddyDatePipe,
    GiddyMoneyPipe,
    GiddyTimeRangePipe,
  ],
  templateUrl: './party-overview-page.html',
  styleUrl: './party-overview-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyOverviewPage {
  private readonly api = inject(PARTIES_API);
  private readonly dialogs = inject(GiddyDialog);
  private readonly router = inject(Router);

  /** From the route. */
  readonly partyId = input.required<string>();

  protected readonly overview = new ResourceLoader(
    () => this.api.overview(this.partyId()),
    () => false,
    false,
  );
  protected readonly bookings = new ResourceLoader(
    () => this.api.bookings(this.partyId()),
    (bookings) => bookings.length === 0,
    false,
  );

  constructor() {
    effect(() => {
      this.partyId();
      untracked(() => {
        this.overview.reload();
        this.bookings.reload();
      });
    });
  }

  protected readonly party = computed(() => this.overview.value() ?? null);
  protected readonly isDraft = computed(() => {
    const party = this.party();
    return !!party && !party.locked && party.planned === 0 && !party.venueName;
  });
  protected readonly canPlan = computed(() => {
    const party = this.party();
    return !!party && !party.locked && party.role !== 'viewer';
  });
  protected readonly breadcrumb = computed(() => [
    { label: 'My parties', link: '/parties' },
    { label: this.party()?.name ?? 'Party' },
  ]);
  protected readonly subtitle = computed(() => {
    const party = this.party();
    if (!party) return '';
    return [
      formatDate(party.date, true),
      formatTimeRange(party.startsAt, party.endsAt),
      party.venueName,
    ]
      .filter(Boolean)
      .join(' · ');
  });
  protected readonly readinessDetail = computed(() => {
    const party = this.party();
    if (!party) return '';
    if (party.locked) return 'Everything happened! Time for thank-yous.';
    const done = `${party.doneTasks} of ${party.totalTasks} tasks done`;
    return party.nextStep ? `${done} · next: ${party.nextStep}` : done;
  });
  protected readonly bookedCount = computed(
    () => (this.bookings.value() ?? []).filter((b) => b.status === 'confirmed').length,
  );
  protected readonly tally = computed(() => {
    const rsvps = this.party()?.rsvps ?? { coming: 0, waiting: 0, cantCome: 0 };
    return [
      { value: rsvps.coming, label: 'Coming', pop: 'mint' as const },
      { value: rsvps.waiting, label: 'Waiting', pop: 'sun' as const },
      { value: rsvps.cantCome, label: 'Can’t come', pop: 'grape' as const },
    ];
  });
  protected readonly budgetCaption = computed(() => {
    const party = this.party();
    if (!party || party.budget === null) return 'No budget set';
    const left = party.budget - party.planned;
    return left >= 0
      ? `of ${formatMoney(party.budget)} · ${formatMoney(left)} left`
      : `of ${formatMoney(party.budget)} · ${formatMoney(-left)} over`;
  });
  protected readonly budgetSegments = computed<MeterSegment[]>(() => {
    const party = this.party();
    const total = Math.max(party?.budget ?? 0, party?.planned ?? 0);
    if (!total) return [];
    return (this.bookings.value() ?? []).map((b) => ({
      percent: (100 * b.price) / total,
      pop: categoryArt[b.category]?.pop ?? 'grape',
    }));
  });

  protected art(booking: PartyBooking) {
    return categoryArt[booking.category] ?? { emoji: '✨', pop: 'grape' as PopColour };
  }

  protected taskDue(task: PartyTask): string {
    if (task.overdue) return `Overdue · was due ${formatDate(task.due)}`;
    const days = Math.round((Date.parse(task.due) - Date.parse(torontoToday())) / 86_400_000);
    return days <= 7
      ? `${formatDate(task.due)} · ${formatRelativeDays(days)}`
      : formatDate(task.due);
  }

  protected roleLabel(member: PartyMember): string {
    return { owner: 'Owner', coPlanner: 'Co-planner', viewer: 'Viewer' }[member.role];
  }

  protected allergyLabel(allergy: string): string {
    return allergy.charAt(0).toUpperCase() + allergy.slice(1);
  }

  protected async askGiddy(): Promise<void> {
    await firstValueFrom(this.api.startConversation(this.partyId()));
    await this.router.navigateByUrl('/ask-giddy');
  }

  protected confirmDelete(): void {
    const party = this.party();
    if (!party) return;
    const data: DeletePartyData = {
      partyId: party.id,
      partyName: party.name,
      confirmedBookings: (this.bookings.value() ?? []).filter((b) => b.status === 'confirmed'),
    };
    this.dialogs
      .open<boolean, DeletePartyData, DeletePartyDialog>(DeletePartyDialog, data, {
        autoFocus: '[data-initial-focus]',
      })
      .closed.subscribe((deleted) => {
        if (deleted) void this.router.navigateByUrl('/parties');
      });
  }
}
