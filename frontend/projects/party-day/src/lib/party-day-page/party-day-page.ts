import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiProblem, PARTIES_API, RUN_SHEET_API, RunStep } from '@giddy/api';
import {
  BreadcrumbComponent,
  ButtonComponent,
  CardComponent,
  EmptyStateComponent,
  ListItemComponent,
  SkeletonComponent,
  TabNavComponent,
  TimelineComponent,
  TimelineItemComponent,
  TimelineStepState,
  ToastComponent,
  ToastRegionComponent,
  IconComponent,
} from '@giddy/components';
import {
  ConnectionStatus,
  OfflineCache,
  OfflineStore,
  ResourceLoader,
  formatDate,
  formatTime,
  formatTimeRange,
  partySections,
  torontoToday,
} from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { callEmoji } from './call-emoji';
import { stepPops } from './step-pops';

/** How often the current step is worked out again from the time in Toronto. */
const tickMs = 30_000;

/** The party day: timed steps with Now and Done, quick calls and the allergy check, offline too. */
@Component({
  imports: [
    BreadcrumbComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    IconComponent,
    ListItemComponent,
    SkeletonComponent,
    TabNavComponent,
    TimelineComponent,
    TimelineItemComponent,
    ToastComponent,
    ToastRegionComponent,
  ],
  templateUrl: './party-day-page.html',
  styleUrl: './party-day-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyDayPage {
  private readonly runSheetApi = inject(RUN_SHEET_API);
  private readonly partiesApi = inject(PARTIES_API);
  private readonly cache = inject(OfflineCache);
  private readonly store = inject(OfflineStore);
  protected readonly connection = inject(ConnectionStatus);

  /** From the route. */
  readonly partyId = input.required<string>();

  protected readonly party = new ResourceLoader(
    () => this.cache.load(`overview:${this.partyId()}`, this.partiesApi.overview(this.partyId())),
    () => false,
    false,
  );
  protected readonly sheet = new ResourceLoader(
    () => this.cache.load(`run-sheet:${this.partyId()}`, this.runSheetApi.get(this.partyId())),
    (sheet) => sheet.steps.length === 0,
    false,
  );
  protected readonly drafting = signal(false);
  protected readonly problem = signal<string | null>(null);
  /** Now, as milliseconds; moves on every 30 seconds. */
  private readonly now = signal(Date.now());

  protected readonly canPlan = computed(() => {
    const party = this.party.value();
    return !!party && party.role !== 'viewer' && !party.locked;
  });
  protected readonly sections = computed(() => partySections(this.partyId()));
  protected readonly breadcrumb = computed(() => [
    { label: 'My parties', link: '/parties' },
    { label: this.party.value()?.name ?? 'Party', link: `/parties/${this.partyId()}` },
    { label: 'Party day' },
  ]);
  protected readonly isToday = computed(
    () => this.sheet.value()?.date === torontoToday(new Date(this.now())),
  );
  protected readonly subtitle = computed(() => {
    const sheet = this.sheet.value();
    if (!sheet) return '';
    const when = `${formatDate(sheet.date)} · ${formatTimeRange(sheet.startsAt, sheet.endsAt)}`;
    const kids = `${sheet.coming} ${sheet.coming === 1 ? 'kid' : 'kids'} coming`;
    return `${this.isToday() ? 'Today! ' : ''}${when} · ${kids}`;
  });
  /** Each step's state: before the day all are to come, after it all are done. */
  protected readonly states = computed<TimelineStepState[]>(() => {
    const sheet = this.sheet.value();
    if (!sheet) return [];
    const today = torontoToday(new Date(this.now()));
    if (sheet.date > today) return sheet.steps.map(() => 'upcoming');
    if (sheet.date < today) return sheet.steps.map(() => 'done');
    const time = torontoClock(new Date(this.now()));
    const current = sheet.steps.filter((s) => s.time <= time).length - 1;
    return sheet.steps.map((_, i) => (i < current ? 'done' : i === current ? 'now' : 'upcoming'));
  });

  constructor() {
    effect(() => {
      this.partyId();
      untracked(() => {
        this.party.reload();
        this.sheet.reload();
      });
    });
    effect(() => {
      // The device remembers this party's run sheet for the offline page.
      if (this.sheet.status() === 'ready') void this.store.set('last-run-sheet', this.partyId());
    });
    const timer = setInterval(() => this.now.set(Date.now()), tickMs);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected time(step: RunStep): string {
    return formatTime(step.time);
  }

  protected pop(index: number) {
    return stepPops[index % stepPops.length];
  }

  protected emoji(role: string): string {
    return callEmoji(role);
  }

  protected async draft(): Promise<void> {
    this.drafting.set(true);
    try {
      await firstValueFrom(this.runSheetApi.draft(this.partyId()));
      this.sheet.reload();
    } catch (error) {
      this.problem.set(
        error instanceof HttpErrorResponse && error.status === 409
          ? (error.error as ApiProblem).title
          : 'Giddy couldn’t draft the run sheet. Try again in a moment.',
      );
      setTimeout(() => this.problem.set(null), 8000);
    } finally {
      this.drafting.set(false);
    }
  }
}

/** "13:40": the time now in Toronto, comparable with the steps' times. */
function torontoClock(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(now);
}
