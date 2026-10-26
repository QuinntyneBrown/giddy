import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** A venue's page with its booking card. */
export class VenueDetailPage extends AppShellPage {
  readonly favourite: Locator;
  readonly gallery: Locator;
  readonly bookingCard: Locator;
  readonly reviews: Locator;

  constructor(page: Page) {
    super(page);
    this.favourite = page.getByRole('button', { name: 'Save to favourites' });
    this.gallery = page.getByRole('img', { name: /^Photos:/ });
    this.bookingCard = page.getByRole('complementary');
    this.reviews = page.getByRole('region', { name: 'What parents say' });
  }

  async openVenue(id: string, query = '?date=2026-11-14'): Promise<void> {
    await this.open(`/venues/${id}${query}`);
  }

  heading(name: string): Locator {
    return this.page.getByRole('heading', { level: 1, name });
  }

  slot(label: string): Locator {
    return this.bookingCard.getByRole('button', { name: new RegExp(`^${label}`) });
  }

  bookButton(): Locator {
    return this.bookingCard.getByRole('button', { name: /^Book / });
  }

  async book(): Promise<void> {
    await this.bookButton().click();
  }

  yourBooking(): Locator {
    return this.bookingCard.filter({
      has: this.page.getByRole('heading', { name: 'Your booking' }),
    });
  }

  async cancelBooking(): Promise<void> {
    await this.bookingCard.getByRole('button', { name: 'Cancel booking' }).click();
  }

  async finishBooking(): Promise<void> {
    await this.bookingCard.getByRole('button', { name: 'Finish booking' }).click();
  }

  async tellMeIfASlotOpens(): Promise<void> {
    await this.bookingCard.getByRole('button', { name: 'Tell me if a slot opens' }).click();
  }
}
