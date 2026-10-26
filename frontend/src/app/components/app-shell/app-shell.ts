import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AUTH_API, ApiProblem } from '@giddy/api';
import { ConflictDialog } from '@giddy/checklist';
import { filter, firstValueFrom, map } from 'rxjs';
import {
  ConnectionStatus,
  CookieChoice,
  CookieConsent,
  OfflineStore,
  PushPrompt,
  SessionStore,
  SyncConflict,
  TaskSync,
  UnreadNotifications,
} from '@giddy/core';
import { LiveRsvpToasts } from '@giddy/guests';
import { ThemeService } from '../../theme/theme.service';
import {
  AlertComponent,
  AvatarComponent,
  BadgeComponent,
  BottomNavComponent,
  ButtonComponent,
  ConsentBarComponent,
  ErrorPageComponent,
  FooterComponent,
  GiddyDialog,
  IconComponent,
  NavGroup,
  NavItem,
  SidebarNavComponent,
  SkipLinkComponent,
  ToastComponent,
  ToastRegionComponent,
  TopBarComponent,
} from '@giddy/components';

@Component({
  selector: 'giddy-app-shell',
  imports: [
    AlertComponent,
    AvatarComponent,
    BadgeComponent,
    BottomNavComponent,
    ButtonComponent,
    ConsentBarComponent,
    ErrorPageComponent,
    IconComponent,
    FooterComponent,
    LiveRsvpToasts,
    SidebarNavComponent,
    SkipLinkComponent,
    ToastComponent,
    ToastRegionComponent,
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
  protected readonly sync = inject(TaskSync);
  private readonly dialog = inject(GiddyDialog);
  private readonly store = inject(OfflineStore);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  private readonly auth = inject(AUTH_API);
  protected readonly verifyText = signal(
    'This reminder stays until your email is confirmed. Everything else works as normal.',
  );
  /** The run sheet this device has saved, for the offline page. */
  protected readonly savedRunSheet = signal<string | null>(null);
  /** A page opened while offline that isn't saved on the device. */
  protected readonly offlinePage = signal(false);
  protected readonly syncedText = computed(() => {
    const synced = this.sync.result()?.synced ?? 0;
    return synced
      ? `${synced} ${synced === 1 ? 'change' : 'changes'} synced: ${synced} checklist ${synced === 1 ? 'tick' : 'ticks'}.`
      : 'You’re connected again.';
  });

  protected readonly unread = inject(UnreadNotifications).count;
  protected readonly push = inject(PushPrompt);
  protected readonly cookies = inject(CookieConsent);
  protected readonly cookieSaved = signal<string | null>(null);
  protected readonly bellLabel = computed(() =>
    this.unread() ? `Notifications, ${this.unread()} unread` : 'Notifications',
  );
  protected readonly sidebarGroups = computed<NavGroup[]>(() => [
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
        {
          label: 'Notifications',
          link: '/notifications',
          icon: 'bell',
          count: this.unread() || undefined,
          countLabel: `${this.unread()} unread`,
        },
        { label: 'Settings', link: '/settings', icon: 'settings' },
      ],
    },
  ]);

  protected readonly bottomItems: NavItem[] = [
    { label: 'Home', link: '/', icon: 'home', exact: true },
    { label: 'Explore', link: '/venues', icon: 'explore' },
    { label: 'Ask Giddy', link: '/ask-giddy', icon: 'sparkle' },
    { label: 'Parties', link: '/parties', icon: 'parties' },
    { label: 'Family', link: '/family', icon: 'family' },
  ];

  protected chooseCookies(choice: CookieChoice): void {
    this.cookies.choose(choice);
    this.cookieSaved.set(choice === 'all' ? 'Allow all.' : 'Essential only.');
  }

  protected readonly footerLinks = [
    { label: 'Help', link: '/help' },
    { label: 'Terms & privacy', link: '/legal' },
  ];

  constructor() {
    let previous = this.router.url;
    effect(() => {
      const url = this.url();
      const opened = url !== previous;
      previous = url;
      if (this.connection.online()) this.offlinePage.set(false);
      else if (opened) this.offlinePage.set(!savedOnDevice(url));
    });
    effect(() => {
      if (this.offlinePage())
        void this.store
          .get<string>('last-run-sheet')
          .then((id) => this.savedRunSheet.set(id ? `/parties/${id}/day` : null));
    });
  }

  protected async resendLink(email: string): Promise<void> {
    try {
      await firstValueFrom(this.auth.resendVerification(email));
      this.verifyText.set(`We sent a new link to ${email}.`);
    } catch (error) {
      this.verifyText.set(
        error instanceof HttpErrorResponse && error.status === 429
          ? (error.error as ApiProblem).title
          : 'We couldn’t send a new link. Try again in a moment.',
      );
    }
  }

  protected review(conflict: SyncConflict): void {
    this.dialog.open<boolean, SyncConflict, ConflictDialog>(ConflictDialog, conflict, {
      autoFocus: '[data-initial-focus]',
    });
  }

  protected tryAgain(): void {
    if (this.connection.online()) this.offlinePage.set(false);
  }

  protected acknowledge(): void {
    this.connection.acknowledgeReconnected();
    this.sync.dismissResult();
  }

  protected search(query: string): void {
    void this.router.navigate(['/venues'], { queryParams: query ? { q: query } : {} });
  }
}

/** Pages that work offline from what the device saved: a party's run sheet and checklist. */
function savedOnDevice(url: string): boolean {
  return /^\/parties\/[^/]+\/(day|checklist)(\?|#|$)/.test(url);
}
