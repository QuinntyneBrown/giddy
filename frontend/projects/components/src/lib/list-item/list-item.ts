import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PopColour } from '../pop/pop-colour';

/**
 * A row in a list: an emoji in a pop circle, an optional overline, a title and a line of detail.
 * Project extra body content with giddyListItemBody and trailing content (badges, prices) by default.
 */
@Component({
  selector: 'li[giddy-list-item]',
  templateUrl: './list-item.html',
  styleUrl: './list-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'list__item' },
})
export class ListItemComponent {
  readonly emoji = input.required<string>();
  readonly pop = input<PopColour>('grape');
  readonly overline = input<string | null>(null);
  readonly heading = input.required<string>();
  readonly meta = input<string | null>(null);
}
