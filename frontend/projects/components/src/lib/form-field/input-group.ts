import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** An input with a fixed prefix, such as a $ for money. */
@Component({
  selector: 'giddy-input-group',
  templateUrl: './input-group.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'input-group' },
})
export class InputGroupComponent {
  readonly prefix = input.required<string>();
}
