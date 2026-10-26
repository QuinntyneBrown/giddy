import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * The narrow, centred card for signing up, signing in and account links: an optional emoji, the
 * page's only heading, a short lead, the projected content, then help and legal links.
 */
@Component({
  selector: 'giddy-auth-card',
  imports: [RouterLink],
  templateUrl: './auth-card.html',
  styleUrl: './auth-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'auth-card' },
})
export class AuthCardComponent {
  readonly heading = input.required<string>();
  readonly lead = input<string | null>(null);
  readonly emoji = input<string | null>(null);
}
