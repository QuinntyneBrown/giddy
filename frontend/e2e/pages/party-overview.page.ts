import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** A party's overview. */
export class PartyOverviewPage extends AppShellPage {
  readonly heading: Locator;
  readonly hero: Locator;
  readonly readiness: Locator;
  readonly bookings: Locator;
  readonly checklist: Locator;
  readonly guests: Locator;
  readonly budget: Locator;
  readonly planners: Locator;
  readonly lockedAlert: Locator;
  readonly nothingBooked: Locator;
  readonly deleteButton: Locator;
  readonly bookingUpdates: Locator;
  readonly sections: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Party overview' });
    this.hero = page.getByRole('region').filter({ has: page.locator('.countdown') });
    this.readiness = this.hero.getByRole('img', { name: /ready/ });
    this.bookings = page.getByRole('region', { name: 'Booked & to book' });
    this.checklist = page.getByRole('region', { name: 'Next on the checklist' });
    this.guests = page.getByRole('region', { name: 'Guests' });
    this.budget = page.getByRole('region', { name: 'Budget' });
    this.planners = page.getByRole('region', { name: 'Planning together' });
    this.lockedAlert = page.getByRole('status').filter({ hasText: 'This party has happened!' });
    this.nothingBooked = page.getByRole('region', { name: 'Nothing booked yet' });
    this.deleteButton = page.getByRole('button', { name: 'Delete this party' });
    this.bookingUpdates = page.getByRole('region', { name: 'Booking updates' });
    this.sections = page.getByRole('navigation', { name: 'Party sections' });
  }

  async openParty(id: string): Promise<void> {
    await this.open(`/parties/${id}`);
  }

  notice(title: string): Locator {
    return this.bookingUpdates.locator('.alert').filter({ hasText: title });
  }

  async dismissNotice(title: string): Promise<void> {
    await this.notice(title).getByRole('button', { name: 'Dismiss' }).click();
  }

  bookingRow(category: string): Locator {
    return this.bookings.getByRole('listitem').filter({ hasText: category });
  }

  tasks(): Locator {
    return this.checklist.getByRole('listitem');
  }

  bookingsWarning(): Locator {
    return this.bookings.getByRole('status');
  }

  async retryBookings(): Promise<void> {
    await this.bookingsWarning().getByRole('button', { name: 'Try again' }).click();
  }

  async startDelete(): Promise<void> {
    await this.deleteButton.click();
  }

  path(): string {
    return new URL(this.page.url()).pathname;
  }
}
