import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TallyItem } from './tally-item';

/** Big counts side by side, such as Coming, Waiting and Can’t come. */
@Component({
  selector: 'giddy-tally',
  templateUrl: './tally.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tally' },
})
export class TallyComponent {
  readonly items = input.required<TallyItem[]>();
}
