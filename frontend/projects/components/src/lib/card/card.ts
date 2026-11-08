import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PopColour } from '../pop/pop-colour';

let nextId = 0;

/**
 * A titled surface for one section of a page, or one card in a list (`li[giddy-card]`). It is
 * labelled by its heading, a level-two heading unless `headingLevel` says 3 (a card inside a section).
 */
@Component({
  selector: 'section[giddy-card], li[giddy-card]',
  templateUrl: './card.html',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'card stack',
    '[class]': "pop() ? 'pop--' + pop() : ''",
    '[attr.aria-labelledby]': 'headingId',
  },
})
export class CardComponent {
  readonly heading = input.required<string>();
  readonly pop = input<PopColour | null>(null);
  readonly headingLevel = input<2 | 3>(2);
  protected readonly headingId = `giddy-card-${nextId++}`;
}
