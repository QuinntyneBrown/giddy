import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Giddy's balloon mark, shown beside the wordmark. */
@Component({
  selector: 'svg[giddy-logo-mark]',
  templateUrl: './logo-mark.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'logo-mark', 'aria-hidden': 'true', viewBox: '0 0 32 32' },
})
export class LogoMarkComponent {}
