import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** Wrap-up after the party: thank-you notes, ratings, final numbers and next year. */
export class WrapUpPage extends AppShellPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly notOpenYet: Locator;
  readonly drafted: Locator;
  readonly notes: Locator;
  readonly sendNotes: Locator;
  readonly sentStatus: Locator;
  readonly ratings: Locator;
  readonly finalNumbers: Locator;
  readonly saveTemplate: Locator;
  readonly templateSaved: Locator;
  readonly startFromTemplate: Locator;
  readonly toasts: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Wrap-up' });
    this.subtitle = page.locator('.page-header .subtitle');
    this.notOpenYet = page.getByRole('region', { name: 'Wrap-up opens after the party' });
    this.drafted = page.getByRole('status').filter({ hasText: /^\s*Giddy drafted/ });
    this.notes = page.getByRole('list', { name: 'Thank-you notes' });
    this.sendNotes = page.getByRole('button', { name: /^Send \d+ notes?$/ });
    this.sentStatus = page.getByRole('status').filter({ hasText: /thank-you notes? sent/ });
    this.ratings = page.getByRole('region', { name: 'How was everyone?' });
    this.finalNumbers = page.getByRole('region', { name: 'Final numbers' });
    this.saveTemplate = page.getByRole('button', { name: 'Save as template' });
    this.templateSaved = page.getByRole('status').filter({ hasText: 'Plan saved for next time' });
    this.startFromTemplate = page.getByRole('link', { name: 'Start a party from it' });
    this.toasts = page.locator('giddy-toast');
  }

  async openWrapUp(partyId: string): Promise<void> {
    await this.open(`/parties/${partyId}/wrap-up`);
  }

  note(childName: string): Locator {
    return this.notes.getByRole('listitem').filter({ hasText: `To ${childName}` });
  }

  editNote(childName: string): Locator {
    return this.page.getByRole('button', { name: `Edit the note to ${childName}` });
  }

  stars(provider: string, count: number): Locator {
    return this.ratings
      .getByRole('group', { name: provider })
      .getByRole('button', { name: count === 1 ? '1 star' : `${count} stars`, exact: true });
  }

  addReview(provider: string): Locator {
    return this.ratings.getByRole('button', { name: `Add a review of ${provider}` });
  }

  number(term: string): Locator {
    return this.finalNumbers
      .locator('dt', { hasText: term })
      .locator('xpath=following-sibling::dd[1]');
  }
}
