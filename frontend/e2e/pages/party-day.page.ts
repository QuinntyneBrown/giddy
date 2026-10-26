import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** The party-day run sheet: timed steps, quick calls and the allergy check. */
export class PartyDayPage extends AppShellPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly sections: Locator;
  readonly timeline: Locator;
  readonly quickCalls: Locator;
  readonly allergyCheck: Locator;
  readonly emptyState: Locator;
  readonly savedNote: Locator;
  readonly toasts: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Party day' });
    this.subtitle = page.locator('.page-header .subtitle');
    this.sections = page.getByRole('navigation', { name: 'Party sections' });
    this.timeline = page.getByRole('list', { name: 'Run sheet' });
    this.quickCalls = page.getByRole('region', { name: 'Quick calls' });
    this.allergyCheck = page.getByRole('region', { name: 'Allergy check' });
    this.emptyState = page.locator('[giddy-empty-state]');
    this.savedNote = page.getByText('Saved on this device. Calls still work');
    this.toasts = page.locator('giddy-toast');
  }

  async openPartyDay(partyId: string): Promise<void> {
    await this.open(`/parties/${partyId}/day`);
  }

  step(title: string): Locator {
    return this.timeline.getByRole('listitem').filter({ hasText: title });
  }

  current(): Locator {
    return this.timeline.locator('[aria-current="step"]');
  }

  call(name: string): Locator {
    return this.quickCalls.getByRole('link', { name: `Call ${name}` });
  }

  async stepTitles(): Promise<string[]> {
    return this.timeline.locator('.list__title').allInnerTexts();
  }
}
