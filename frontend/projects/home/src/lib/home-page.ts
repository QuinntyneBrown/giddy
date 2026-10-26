import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HOME_API, Nudge } from '@giddy/api';
import {
  AlertComponent,
  AvatarComponent,
  BadgeComponent,
  BadgeTone,
  ButtonComponent,
  CardComponent,
  EmptyStateComponent,
  HeroComponent,
  IconComponent,
  ListItemComponent,
  MascotComponent,
  PartyHeroComponent,
  PopColour,
  QuickActionComponent,
  SkeletonComponent,
  TallyComponent,
} from '@giddy/components';
import {
  GiddyDatePipe,
  GiddyTimeRangePipe,
  ResourceLoader,
  SessionStore,
  formatDate,
  formatRelativeDays,
  greetingAt,
} from '@giddy/core';

const nudgeStyle: Record<
  Nudge['kind'],
  { label: string; tone: BadgeTone; emoji: string; pop: PopColour }
> = {
  overdue: { label: 'Overdue', tone: 'danger', emoji: '⏰', pop: 'orange' },
  needsYou: { label: 'Needs you', tone: 'warning', emoji: '📋', pop: 'pink' },
  idea: { label: 'Idea', tone: 'info', emoji: '💡', pop: 'sun' },
};

/** Home: the soonest party, Giddy's nudges, quick start, RSVPs and the next birthday. */
@Component({
  imports: [
    RouterLink,
    AlertComponent,
    AvatarComponent,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    HeroComponent,
    IconComponent,
    ListItemComponent,
    MascotComponent,
    PartyHeroComponent,
    QuickActionComponent,
    SkeletonComponent,
    TallyComponent,
    GiddyDatePipe,
    GiddyTimeRangePipe,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly api = inject(HOME_API);
  private readonly session = inject(SessionStore).session;

  protected readonly home = new ResourceLoader(
    () => this.api.get(),
    (home) => home.nextParty === null && home.partiesInProgress === 0,
  );
  protected readonly nudges = new ResourceLoader(() => this.api.nudges());

  protected readonly firstName = computed(() => this.session()?.name.split(' ')[0] ?? '');
  protected readonly heading = computed(() =>
    this.home.status() === 'empty'
      ? `Welcome to Giddy, ${this.firstName()}`
      : `${greetingAt(new Date())}, ${this.firstName()}`,
  );
  protected readonly subtitle = computed(() => {
    const home = this.home.value();
    if (!home || this.home.status() !== 'ready') return null;
    const parts = [
      `${home.partiesInProgress} ${home.partiesInProgress === 1 ? 'party' : 'parties'} in progress`,
      `${home.needsYou} ${home.needsYou === 1 ? 'thing needs' : 'things need'} you this week`,
    ];
    if (home.nextParty?.guests)
      parts.push(`${home.rsvps.coming} of ${home.nextParty.guests} guests coming`);
    return parts.join(' · ');
  });
  protected readonly tally = computed(() => {
    const rsvps = this.home.value()?.rsvps ?? { coming: 0, waiting: 0, cantCome: 0 };
    return [
      { value: rsvps.coming, label: 'Coming', pop: 'mint' as const },
      { value: rsvps.waiting, label: 'Waiting', pop: 'sun' as const },
      { value: rsvps.cantCome, label: 'Can’t come', pop: 'grape' as const },
    ];
  });

  protected style(nudge: Nudge) {
    return nudgeStyle[nudge.kind];
  }

  protected stepsDetail(done: number, total: number, next: string | null): string {
    const steps = `${done} of ${total} steps done`;
    return next ? `${steps} · next: ${next}` : steps;
  }

  protected birthdayWhen(date: string, daysAway: number): string {
    return `${formatDate(date, true)} · ${formatRelativeDays(daysAway)}`;
  }
}
