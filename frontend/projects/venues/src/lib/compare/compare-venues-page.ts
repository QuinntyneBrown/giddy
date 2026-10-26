import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { VENUES_API } from '@giddy/api';
import {
  AlertComponent,
  BestValueComponent,
  BreadcrumbComponent,
  ButtonComponent,
  EmptyStateComponent,
  IconComponent,
  SkeletonComponent,
  TableWrapComponent,
} from '@giddy/components';
import { ResourceLoader, formatDate } from '@giddy/core';
import { of } from 'rxjs';

/** Two or three venues side by side, with the best value in each row and Giddy's pick. */
@Component({
  imports: [
    RouterLink,
    AlertComponent,
    BestValueComponent,
    BreadcrumbComponent,
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
    TableWrapComponent,
  ],
  templateUrl: './compare-venues-page.html',
  styleUrl: './compare-venues-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompareVenuesPage {
  private readonly api = inject(VENUES_API);

  readonly ids = input<string>();
  readonly date = input<string>();
  readonly partyId = input<string>();

  protected readonly venueIds = computed(() => (this.ids() ?? '').split(',').filter(Boolean));
  protected readonly comparison = new ResourceLoader(
    () =>
      this.venueIds().length >= 2
        ? this.api.compare(this.venueIds(), this.date() ?? '', this.partyId() ?? null)
        : of(null),
    (value) => value === null,
    false,
  );
  protected readonly breadcrumb = [{ label: 'Venues', link: '/venues' }, { label: 'Compare' }];
  protected readonly subtitle = computed(() =>
    this.date() ? `For ${formatDate(this.date()!)}` : '',
  );

  constructor() {
    effect(() => {
      this.venueIds();
      this.date();
      untracked(() => this.comparison.reload());
    });
  }
}
