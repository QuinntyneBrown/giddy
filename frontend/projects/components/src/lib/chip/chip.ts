import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A compact pill button: a suggestion, a filter or a choice. */
@Component({
  selector: 'button[giddy-chip]',
  templateUrl: './chip.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'chip', '[attr.aria-pressed]': 'pressed()' },
})
export class ChipComponent {
  readonly pressed = input<boolean | null>(null);
}
