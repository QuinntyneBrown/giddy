import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DescriptionItem } from './description-item';

/** Term and detail pairs, such as Who, When and Where. */
@Component({
  selector: 'dl[giddy-description-list]',
  templateUrl: './description-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'dl' },
})
export class DescriptionListComponent {
  readonly items = input.required<DescriptionItem[]>();
}
