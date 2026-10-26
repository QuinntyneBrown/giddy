import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../icon/icon';
import { BadgeComponent } from '../badge/badge';
import { NavItem } from '../sidebar-nav/nav-item';

/** Fixed bottom tab bar below 1024px. The item at `ctaIndex` is raised as the main action. */
@Component({
  selector: 'nav[giddy-bottom-nav]',
  imports: [RouterLink, RouterLinkActive, IconComponent, BadgeComponent],
  templateUrl: './bottom-nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bottom-nav' },
})
export class BottomNavComponent {
  readonly items = input.required<NavItem[]>();
  readonly ctaIndex = input<number | null>(null);
}
