import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button';
import { IconComponent } from '../icon/icon';

/**
 * Choose 1 to 5 stars. A group named by its legend, with a toggle button per star; the chosen
 * one is pressed and the stars up to it are filled.
 */
@Component({
  selector: 'fieldset[giddy-star-rating]',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'star-rating' },
})
export class StarRatingComponent {
  /** What is being rated, for example the venue's name. */
  readonly label = input.required<string>();
  readonly value = input<number | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly rated = output<number>();
  protected readonly stars = [1, 2, 3, 4, 5];
}
