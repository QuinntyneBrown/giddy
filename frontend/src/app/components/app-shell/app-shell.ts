import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  BottomNavComponent,
  FooterComponent,
  NavGroup,
  NavItem,
  SidebarNavComponent,
  SkipLinkComponent,
  TopBarComponent,
} from '@giddy/components';

@Component({
  selector: 'giddy-app-shell',
  imports: [
    BottomNavComponent,
    FooterComponent,
    SidebarNavComponent,
    SkipLinkComponent,
    TopBarComponent,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'has-bottom-nav' },
})
export class AppShellComponent {
  private readonly router = inject(Router);

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
