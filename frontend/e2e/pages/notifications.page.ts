import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** The notification centre: new ones first, then earlier ones. */
export class NotificationsPage extends AppShellPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly markAll: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Notifications' });
    this.subtitle = page.locator('.page-header .subtitle');
    this.markAll = page.getByRole('button', { name: 'Mark all as read' });
    this.emptyState = page.locator('[giddy-empty-state]');
  }

  async openNotifications(): Promise<void> {
    await this.open('/notifications');
  }

  group(name: 'New' | 'Earlier'): Locator {
    return this.page.getByRole('region', { name });
  }

  item(title: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(title.replace(/[$?]/g, '\\$&')) });
  }

  /** The bell in the top bar, named with the unread count. */
  bell(): Locator {
    return this.banner.getByRole('link', { name: /^Notifications/ });
  }
}
