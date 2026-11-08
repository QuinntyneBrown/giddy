import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonComponent } from '../button/button';
import { IconComponent } from '../icon/icon';
import { WordmarkComponent } from '../wordmark/wordmark';
import { BadgeComponent } from '../badge/badge';
import { NavGroup } from './nav-group';

/**
 * Primary navigation from 1024px: wordmark, the main call to action, grouped links with unread
 * badges, and a slot at the bottom (for example the next party's countdown).
 */
@Component({
  selector: 'nav[giddy-sidebar-nav]',
  imports: [
    RouterLink,
    RouterLinkActive,
    ButtonComponent,
    IconComponent,
    WordmarkComponent,
    BadgeComponent,
  ],
  templateUrl: './sidebar-nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sidebar' },
})
export class SidebarNavComponent {
  readonly brandLink = input('/');
  readonly ctaLabel = input<string | null>(null);
  readonly ctaLink = input('/');
  readonly groups = input.required<NavGroup[]>();
}
