import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../icon/icon';

/** An allergy or dietary need, shown with a warning icon and words, never colour alone. */
@Component({
  selector: 'giddy-allergy-tag',
  imports: [IconComponent],
  templateUrl: './allergy-tag.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'allergy' },
})
export class AllergyTagComponent {}
