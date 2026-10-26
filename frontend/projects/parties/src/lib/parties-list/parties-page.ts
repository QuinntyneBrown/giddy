import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PARTIES_API, PartySummary } from '@giddy/api';
import {
  ButtonComponent,
  EmptyStateComponent,
  IconComponent,
  LinkCardComponent,
  PartyHeroComponent,
  PopColour,
  SkeletonComponent,
} from '@giddy/components';
import {
  GiddyDatePipe,
  GiddyTimeRangePipe,
  ResourceLoader,
  formatDate,
  formatRelativeDays,
} from '@giddy/core';

const pops: PopColour[] = ['sky', 'pink', 'mint', 'orange', 'sun', 'grape'];

/** My parties: upcoming with countdown and readiness, drafts, and past parties. */
@Component({
  imports: [
    RouterLink,
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    LinkCardComponent,
    PartyHeroComponent,
    SkeletonComponent,
    GiddyDatePipe,
    GiddyTimeRangePipe,
  ],
  templateUrl: './parties-page.html',
  styleUrl: './parties-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartiesPage {
  private readonly api = inject(PARTIES_API);
  protected readonly parties = new ResourceLoader(
    () => this.api.mine(),
    (parties) => parties.length === 0,
  );

  private readonly byDate = computed(() =>
    [...(this.parties.value() ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
  );
  protected readonly upcoming = computed(() =>
    this.byDate().filter((p) => p.status === 'upcoming'),
  );
  protected readonly drafts = computed(() => this.byDate().filter((p) => p.status === 'draft'));
  protected readonly past = computed(() =>
    this.byDate()
      .filter((p) => p.status === 'past')
      .reverse(),
  );
  protected readonly subtitle = computed(() => {
    const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
    return [
      count(this.upcoming().length, 'upcoming', 'upcoming'),
      count(this.drafts().length, 'draft', 'drafts'),
      count(this.past().length, 'past', 'past'),
    ].join(' · ');
  });

  protected pop(index: number): PopColour {
    return pops[index % pops.length];
  }

  protected draftMeta(party: PartySummary): string {
    const plan = party.theme ? 'theme picked, no venue yet' : 'no plan yet';
    return `${formatDate(party.date, true)} · ${formatRelativeDays(party.daysToGo)} · ${plan}`;
  }

  protected pastMeta(party: PartySummary): string {
    return [
      formatDate(party.date, true),
      party.venueName,
      party.guests ? `${party.guests} kids` : null,
    ]
      .filter(Boolean)
      .join(' · ');
  }

  protected readinessDetail(party: PartySummary): string {
    return party.venueName ? `At ${party.venueName}` : 'Venue still to pick';
  }
}
