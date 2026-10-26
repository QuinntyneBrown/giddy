import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { IconName } from '../icon/icon-name';

let nextId = 0;

/**
 * A consent bar pinned to the bottom of the screen, such as the cookie choice. Project its
 * choices as buttons or links of equal weight.
 */
@Component({
  selector: 'section[giddy-consent-bar]',
  imports: [IconComponent],
  templateUrl: './consent-bar.html',
  styleUrl: './consent-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'card consent stack',
    role: 'region',
    '[attr.aria-labelledby]': 'headingId',
  },
})
export class ConsentBarComponent {
  readonly heading = input.required<string>();
  readonly text = input.required<string>();
  readonly icon = input<IconName>('cookie');
  protected readonly headingId = `consent-bar-${++nextId}`;
}
