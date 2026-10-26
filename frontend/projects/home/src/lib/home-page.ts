import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PARTIES_API } from '@giddy/api';
import {
  ButtonComponent,
  EmptyStateComponent,
  HeroComponent,
  IconComponent,
  MascotComponent,
  PartyCardComponent,
  SkeletonComponent,
} from '@giddy/components';
import {
  GiddyDatePipe,
  GiddyTimeRangePipe,
  ResourceLoader,
  SessionStore,
  greetingAt,
} from '@giddy/core';

@Component({
  imports: [
    RouterLink,
    ButtonComponent,
    EmptyStateComponent,
    HeroComponent,
    IconComponent,
    MascotComponent,
    PartyCardComponent,
    SkeletonComponent,
    GiddyDatePipe,
    GiddyTimeRangePipe,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly partiesApi = inject(PARTIES_API);
  private readonly session = inject(SessionStore).session;

  protected readonly parties = new ResourceLoader(
    () => this.partiesApi.mine(),
    (parties) => parties.length === 0,
  );
  protected readonly nextParty = computed(
    () => this.parties.value()?.find((party) => party.daysToGo >= 0) ?? this.parties.value()?.[0],
  );
  protected readonly firstName = computed(() => this.session()?.name.split(' ')[0] ?? '');
  protected readonly heading = computed(() =>
    this.parties.status() === 'empty'
      ? `Welcome to Giddy, ${this.firstName()}`
      : `${greetingAt(new Date())}, ${this.firstName()}`,
  );
}
