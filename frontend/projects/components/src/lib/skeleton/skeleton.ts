import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A placeholder shaped like the content it stands in for. Mark the loading region with
 * aria-busy="true"; skeletons themselves are hidden from assistive technology.
 */
@Component({
  selector: 'giddy-skeleton',
  templateUrl: './skeleton.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'skeleton',
    'aria-hidden': 'true',
    '[class.skeleton--text]': "shape() === 'text'",
    '[class.skeleton--title]': "shape() === 'title'",
    '[class.skeleton--rect]': "shape() === 'rect'",
    '[class.skeleton--circle]': "shape() === 'circle'",
    '[style.width]': 'width()',
    '[style.height]': 'height()',
  },
})
export class SkeletonComponent {
  readonly shape = input<'text' | 'title' | 'rect' | 'circle'>('text');
  readonly width = input<string | null>(null);
  readonly height = input<string | null>(null);
}
