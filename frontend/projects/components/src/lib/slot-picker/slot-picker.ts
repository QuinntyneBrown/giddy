import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SlotOption } from './slot-option';

/** Start times as toggle buttons; taken times are disabled and labelled "booked". */
@Component({
  selector: 'fieldset[giddy-slot-picker]',
  templateUrl: './slot-picker.html',
  styleUrl: './slot-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlotPickerComponent {
  readonly legend = input('Start time');
  readonly slots = input.required<SlotOption[]>();
  readonly selected = input<string | null>(null);
  readonly picked = output<string>();
}
