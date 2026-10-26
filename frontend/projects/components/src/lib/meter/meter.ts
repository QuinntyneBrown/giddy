import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MeterSegment } from './meter-segment';

/** A segmented bar, such as spend by category against a budget. Name it with the label. */
@Component({
  selector: 'giddy-meter',
  templateUrl: './meter.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'meter',
    role: 'img',
    '[attr.aria-label]': 'label()',
    '[class.meter--over]': 'over()',
  },
})
export class MeterComponent {
  readonly segments = input.required<MeterSegment[]>();
  readonly label = input.required<string>();
  readonly over = input(false, { transform: booleanAttribute });
}
