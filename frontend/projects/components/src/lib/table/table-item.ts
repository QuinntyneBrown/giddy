import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PopColour } from '../pop/pop-colour';

/** A table's first cell for an item: a small emoji in a pop circle, a title and a line of detail. */
@Component({
  selector: 'giddy-table-item',
  templateUrl: './table-item.html',
  styleUrl: './table-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'table-item' },
})
export class TableItemComponent {
  readonly emoji = input.required<string>();
  readonly pop = input<PopColour>('grape');
  readonly heading = input.required<string>();
  readonly meta = input<string | null>(null);
}
