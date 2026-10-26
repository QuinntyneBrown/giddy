import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MascotComponent } from '../mascot/mascot';
import { MascotMood } from '../mascot/mascot-mood';

/**
 * Full-page status (404, 403, 500, offline): mascot, a short code line, the page's only heading,
 * a plain-language message and the ways forward (projected buttons and links).
 */
@Component({
  selector: 'giddy-error-page',
  imports: [MascotComponent],
  templateUrl: './error-page.html',
  styleUrl: './error-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorPageComponent {
  readonly code = input.required<string>();
  readonly heading = input.required<string>();
  readonly message = input.required<string>();
  readonly mood = input<MascotMood>('sleepy');
}
