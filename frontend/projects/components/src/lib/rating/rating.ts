import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** A star rating with its review count, read as one phrase by screen readers. */
@Component({
  selector: 'giddy-rating',
  templateUrl: './rating.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rating' },
})
export class RatingComponent {
  readonly value = input.required<number>();
  readonly count = input<number | null>(null);
  /** Write the count as "(212 reviews)" rather than "(212)". */
  readonly long = input(false);
  protected readonly label = computed(() => {
    const count = this.count();
    return `Rated ${this.value().toFixed(1)} out of 5${count === null ? '' : ` from ${count} reviews`}`;
  });
}
