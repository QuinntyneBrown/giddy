import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConnectionStatus, SessionStore } from '@giddy/core';
import { LiveRsvpToasts } from '@giddy/guests';
import { ThemeService } from '../../theme/theme.service';
import {
  AlertComponent,
  AvatarComponent,
  BottomNavComponent,
  ButtonComponent,
  FooterComponent,
  IconComponent,
  NavGroup,
  NavItem,
  SidebarNavComponent,
  SkipLinkComponent,
  TopBarComponent,
} from '@giddy/components';

@Component({
  selector: 'giddy-app-shell',
  imports: [
    AlertComponent,
    AvatarComponent,
    BottomNavComponent,
    ButtonComponent,
    IconComponent,
    FooterComponent,
    LiveRsvpToasts,
    SidebarNavComponent,
    SkipLinkComponent,
    TopBarComponent,
    RouterLink,
    NgTemplateOutlet,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.has-bottom-nav]': 'session()' },
})
export class AppShellComponent {
  private readonly router = inject(Router);
  protected readonly themeService = inject(ThemeService);
  protected readonly session = inject(SessionStore).session;
  protected readonly connection = inject(ConnectionStatus);

  protected readonly sidebarGroups: NavGroup[] = [
    {
      items: [
        { label: 'Home', link: '/', icon: 'home', exact: true },
        { label: 'Ask Giddy', link: '/ask-giddy', icon: 'sparkle' },
        { label: 'My parties', link: '/parties', icon: 'parties' },
      ],
    },
    {
      label: 'Explore',
      items: [
        { label: 'Themes', link: '/themes', icon: 'themes' },
        { label: 'Venues', link: '/venues', icon: 'pin' },
        { label: 'Fun & food', link: '/vendors', icon: 'food' },
      ],
    },
    {
      label: 'You',
      items: [
        { label: 'Family', link: '/family', icon: 'family' },
        { label: 'Notifications', link: '/notifications', icon: 'bell' },
        { label: 'Settings', link: '/settings', icon: 'settings' },
      ],
    },
  ];

  protected readonly bottomItems: NavItem[] = [
    { label: 'Home', link: '/', icon: 'home', exact: true },
    { label: 'Explore', link: '/venues', icon: 'explore' },
    { label: 'Ask Giddy', link: '/ask-giddy', icon: 'sparkle' },
    { label: 'Parties', link: '/parties', icon: 'parties' },
    { label: 'Family', link: '/family', icon: 'family' },
  ];

  protected readonly footerLinks = [
    { label: 'Help', link: '/help' },
    { label: 'Terms & privacy', link: '/legal' },
  ];

  protected search(query: string): void {
    void this.router.navigate(['/venues'], { queryParams: query ? { q: query } : {} });
  }
}
