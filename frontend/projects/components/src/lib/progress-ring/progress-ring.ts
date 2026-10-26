import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A percentage ring, for example a plan's readiness. Name it with the label. */
@Component({
  selector: 'giddy-progress-ring',
  templateUrl: './progress-ring.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ring',
    role: 'img',
    '[attr.aria-label]': 'label()',
    '[style.--value]': 'value()',
  },
})
export class ProgressRingComponent {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
}
