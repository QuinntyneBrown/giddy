import { ChangeDetectionStrategy, Component } from '@angular/core';

/** A minute-by-minute plan: project li[giddy-timeline-item] steps. Name it with aria-label. */
@Component({
  selector: 'ol[giddy-timeline]',
  templateUrl: './timeline.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'timeline' },
})
export class TimelineComponent {}
