import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LegendItem } from './legend-item';

/** Names the colours of a meter or chart: a swatch and words for each. */
@Component({
  selector: 'ul[giddy-legend]',
  templateUrl: './legend.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'legend' },
})
export class LegendComponent {
  readonly items = input.required<LegendItem[]>();
}
