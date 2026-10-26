import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PopColour } from '../pop/pop-colour';
import { BadgeTone } from './badge-tone';

/** A short status or count. Status is always written in words, never colour alone. */
@Component({
  selector: 'giddy-badge',
  templateUrl: './badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'badge',
    '[class.badge--info]': "tone() === 'info'",
    '[class.badge--success]': "tone() === 'success'",
    '[class.badge--warning]': "tone() === 'warning'",
    '[class.badge--danger]': "tone() === 'danger'",
    '[class.badge--count]': "tone() === 'count'",
    '[class]': "pop() ? 'pop--' + pop() : ''",
  },
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('neutral');
  readonly pop = input<PopColour | null>(null);
}
