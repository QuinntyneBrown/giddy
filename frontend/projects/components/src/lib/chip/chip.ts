import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A compact pill: a button for a suggestion, a filter or a choice, or a static tag (a span or a
 * list item) such as a child's interest.
 */
@Component({
  selector: 'button[giddy-chip], span[giddy-chip], li[giddy-chip]',
  templateUrl: './chip.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'chip', '[attr.aria-pressed]': 'pressed()' },
})
export class ChipComponent {
  readonly pressed = input<boolean | null>(null);
}
