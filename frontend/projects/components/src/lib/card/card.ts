import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PopColour } from '../pop/pop-colour';

let nextId = 0;

/** A titled surface for one section of a page. The section is labelled by its heading. */
@Component({
  selector: 'section[giddy-card]',
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
  protected readonly headingId = `giddy-card-${nextId++}`;
}
