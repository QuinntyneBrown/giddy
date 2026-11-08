import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Giddy's balloon symbol, decorative: for places the wordmark won't fit. */
@Component({
  selector: 'svg[giddy-logo-mark]',
  templateUrl: './logo-mark.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'logo-mark', 'aria-hidden': 'true', viewBox: '0 0 48 64' },
})
export class LogoMarkComponent {}
