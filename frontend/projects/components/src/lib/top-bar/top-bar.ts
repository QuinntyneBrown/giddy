import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon';
import { LogoMarkComponent } from '../logo-mark/logo-mark';

/**
 * Sticky top bar with the wordmark, an optional search field (shown from 768px) and a slot for
 * actions such as notifications and the account avatar.
 */
@Component({
  selector: 'header[giddy-top-bar]',
  imports: [RouterLink, IconComponent, LogoMarkComponent],
  templateUrl: './top-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'topbar' },
})
export class TopBarComponent {
  readonly brandLink = input('/');
  /** Hide the wordmark from 1024px, where the sidebar shows it instead. */
  readonly brandOnSmallScreensOnly = input(false, { transform: booleanAttribute });
  /** Accessible label of the search field; the field is omitted when null. */
  readonly searchLabel = input<string | null>(null);
  readonly searchPlaceholder = input('');
  readonly searched = output<string>();

  protected search(event: Event, query: string): void {
    event.preventDefault();
    this.searched.emit(query.trim());
  }
}
