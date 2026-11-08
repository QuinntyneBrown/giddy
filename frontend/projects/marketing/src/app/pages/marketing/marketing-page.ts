import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroComponent } from '@giddy/components';

/** The marketing page (L2-095), composed from the library as docs/screen-composition.md lists. */
@Component({
  selector: 'mk-marketing-page',
  imports: [HeroComponent],
  templateUrl: './marketing-page.html',
  styleUrl: './marketing-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingPageComponent {}
