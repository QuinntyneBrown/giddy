import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A big number. With a label it is the design system's stat, the label above the value, for
 * rows of figures; without one, the value sits beside a short caption.
 */
@Component({
  selector: 'giddy-stat',
  templateUrl: './stat.html',
  styleUrl: './stat.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.stat]': '!!label()',
    '[class.cluster]': '!label()',
    '[class.cluster--between]': '!label()',
  },
})
export class StatComponent {
  readonly value = input.required<string>();
  readonly caption = input('');
  readonly label = input('');
}
