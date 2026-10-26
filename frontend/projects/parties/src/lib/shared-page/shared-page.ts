import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { SHARING_API } from '@giddy/api';
import { CardComponent, ErrorPageComponent, SkeletonComponent } from '@giddy/components';
import { ResourceLoader, formatDate, formatTimeRange } from '@giddy/core';

/** The read-only summary anyone with the view-only link sees; no guests' details. */
@Component({
  imports: [CardComponent, ErrorPageComponent, SkeletonComponent],
  templateUrl: './shared-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedPage {
  private readonly api = inject(SHARING_API);
  readonly token = input.required<string>();
  protected readonly summary = new ResourceLoader(
    () => this.api.shared(this.token()),
    () => false,
    false,
  );
  protected readonly when = computed(() => {
    const s = this.summary.value();
    return s ? `${formatDate(s.date, true)} · ${formatTimeRange(s.startsAt, s.endsAt)}` : '';
  });

  constructor() {
    effect(() => {
      this.token();
      untracked(() => this.summary.reload());
    });
  }
}
