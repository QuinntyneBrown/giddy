import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * An on/off setting that takes effect straight away. Project a checkbox with role="switch"; the
 * label text comes first and the switch sits at the end of the row.
 */
@Component({
  selector: 'label[giddy-switch]',
  templateUrl: './switch.html',
  styleUrl: './switch.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'switch', '[class.switch--block]': 'block()' },
})
export class SwitchComponent {
  readonly description = input<string | null>(null);
  /** Fills the row, with the text at the start and the switch at the end. */
  readonly block = input(false, { transform: booleanAttribute });
}
