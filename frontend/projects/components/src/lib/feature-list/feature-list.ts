import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon';

/** What a place offers, each with a tick. */
@Component({
  selector: 'ul[giddy-feature-list]',
  imports: [IconComponent],
  templateUrl: './feature-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'feature-list' },
})
export class FeatureListComponent {
  readonly features = input.required<string[]>();
}
