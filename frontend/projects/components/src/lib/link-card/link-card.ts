import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BadgeComponent } from '../badge/badge';
import { BadgeTone } from '../badge/badge-tone';
import { IconComponent } from '../icon/icon';
import { PopColour } from '../pop/pop-colour';

/** A whole card that is one link: an emoji, a title (projected) with a status badge, a line of detail. */
@Component({
  selector: 'a[giddy-link-card]',
  imports: [BadgeComponent, IconComponent],
  templateUrl: './link-card.html',
  styleUrl: './link-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'card card--interactive cluster', '[class]': "'pop--' + pop()" },
})
export class LinkCardComponent {
  readonly emoji = input.required<string>();
  readonly meta = input('');
  readonly badge = input<string | null>(null);
  readonly badgeTone = input<BadgeTone>('neutral');
  readonly actionLabel = input<string | null>(null);
  readonly pop = input<PopColour>('grape');
}
