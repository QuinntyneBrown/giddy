import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { WordmarkSize } from './wordmark-size';

/** The giddy wordmark: Giddy's logo, an image named "Giddy" coloured by the logo tokens. */
@Component({
  selector: 'svg[giddy-wordmark]',
  templateUrl: './wordmark.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'wordmark',
    role: 'img',
    viewBox: '0 4 272 132',
    '[class.wordmark--sm]': "size() === 'sm'",
    '[class.wordmark--lg]': "size() === 'lg'",
    '[class.wordmark--xl]': "size() === 'xl'",
    '[attr.aria-label]': 'label()',
  },
})
export class WordmarkComponent {
  readonly size = input<WordmarkSize>('md');
  readonly label = input('Giddy');
}
