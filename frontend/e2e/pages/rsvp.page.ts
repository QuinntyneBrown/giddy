import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** A guest family's private RSVP page. */
export class RsvpPage extends AppShellPage {
  readonly invitation: Locator;
  readonly question: Locator;
  readonly coming: Locator;
  readonly notComing: Locator;
  readonly allergies: Locator;
  readonly parentStays: Locator;
  readonly dropOff: Locator;
  readonly name: Locator;
  readonly mobile: Locator;
  readonly note: Locator;
  readonly send: Locator;
  readonly errorSummary: Locator;
  readonly confirmation: Locator;
  readonly calendar: Locator;
  readonly changeReply: Locator;

  constructor(page: Page) {
    super(page);
    this.invitation = page.locator('[giddy-invite]');
    this.question = page.getByRole('heading', { level: 2, name: /^Will .* come\?$/ });
    this.coming = page.getByRole('radio', { name: /coming!$/ });
    this.notComing = page.getByRole('radio', { name: 'Sorry, can’t make it' });
    this.allergies = page.getByRole('textbox', { name: 'Allergies or dietary needs' });
    this.parentStays = page.getByRole('radio', { name: 'Yes, I’ll stay' });
    this.dropOff = page.getByRole('radio', { name: 'No, drop-off' });
    this.name = page.getByRole('textbox', { name: 'Your name' });
    this.mobile = page.getByRole('textbox', { name: /^Mobile/ });
    this.note = page.getByRole('textbox', { name: /^Note for/ });
    this.send = page.getByRole('button', { name: 'Send my reply' });
    this.errorSummary = page.locator('giddy-error-summary');
    this.confirmation = page.getByRole('region', { name: /^(Yay!|Sorry)/ });
    this.calendar = page.getByRole('link', { name: 'Add to my calendar' });
    this.changeReply = page.getByRole('button', { name: 'Change my reply' });
  }

  async openLink(token: string): Promise<void> {
    await this.open(`/rsvp/${token}`);
  }

  text(): Promise<string> {
    return this.main.innerText();
  }
}
