import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon';

/** A chip with a remove button, named "<removeVerb>: <label>" for assistive technology. */
@Component({
  selector: 'giddy-removable-chip',
  imports: [IconComponent],
  templateUrl: './removable-chip.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'chip' },
})
export class RemovableChipComponent {
  readonly label = input.required<string>();
  readonly removeVerb = input('Remove');
  readonly removed = output<void>();
}
