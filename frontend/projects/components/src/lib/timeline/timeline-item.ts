import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BadgeComponent } from '../badge/badge';
import { PopColour } from '../pop/pop-colour';
import { TimelineStepState } from './timeline-step-state';

/** One step of a timeline: its time, a coloured dot, and a card with the title and details. */
@Component({
  selector: 'li[giddy-timeline-item]',
  imports: [BadgeComponent],
  templateUrl: './timeline-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'timeline__item',
    '[class.timeline__item--done]': "state() === 'done'",
    '[attr.aria-current]': "state() === 'now' ? 'step' : null",
  },
})
export class TimelineItemComponent {
  /** As shown, for example "1:30 pm". */
  readonly time = input.required<string>();
  readonly heading = input.required<string>();
  readonly pop = input<PopColour>('grape');
  readonly state = input<TimelineStepState>('upcoming');
}
