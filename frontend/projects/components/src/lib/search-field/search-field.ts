import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon';

let nextId = 0;

/** A search box with its icon and a label for screen readers; results update as people type. */
@Component({
  selector: 'giddy-search-field',
  imports: [IconComponent],
  templateUrl: './search-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'search' },
})
export class SearchFieldComponent {
  readonly label = input.required<string>();
  readonly placeholder = input<string | null>(null);
  readonly value = input('');
  readonly valueChange = output<string>();
  protected readonly id = `giddy-search-${nextId++}`;
}
