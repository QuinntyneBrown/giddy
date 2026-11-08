import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ButtonComponent,
  HeroComponent,
  MascotComponent,
  TopBarComponent,
} from '@giddy/components';
import { environment } from '../../../environments/environment';

/**
 * The marketing page (L2-095), composed from the library as docs/screen-composition.md lists. Links
 * into the app are absolute addresses built from `environment.appUrl`.
 */
@Component({
  selector: 'mk-marketing-page',
  imports: [ButtonComponent, HeroComponent, MascotComponent, TopBarComponent],
  templateUrl: './marketing-page.html',
  styleUrl: './marketing-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingPageComponent {
  protected readonly signUpUrl = `${environment.appUrl}/sign-up`;
  protected readonly signInUrl = `${environment.appUrl}/sign-in`;
}
