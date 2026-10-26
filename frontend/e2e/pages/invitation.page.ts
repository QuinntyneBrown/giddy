import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** Designing, testing and sending a party's invitation. */
export class InvitationPage extends AppShellPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly preview: Locator;
  readonly headline: Locator;
  readonly message: Locator;
  readonly rsvpBy: Locator;
  readonly byEmail: Locator;
  readonly byText: Locator;
  readonly sendTest: Locator;
  readonly send: Locator;
  readonly sent: Locator;
  readonly problem: Locator;
  readonly toasts: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Invitations' });
    this.subtitle = page.locator('.page-header .subtitle');
    this.preview = page.getByRole('region', { name: 'Preview' });
    this.headline = page.getByRole('textbox', { name: 'Headline' });
    this.message = page.getByRole('textbox', { name: 'Message' });
    this.rsvpBy = page.getByLabel('RSVP by');
    this.byEmail = page.getByRole('checkbox', { name: /^Email/ });
    this.byText = page.getByRole('checkbox', { name: /^Text message/ });
    this.sendTest = page.getByRole('button', { name: 'Send me a test' });
    this.send = page.getByRole('button', { name: /^Send to / });
    this.sent = page.getByRole('status').filter({ hasText: /^Invites sent/ });
    this.problem = page.getByRole('alert');
    this.toasts = page.locator('giddy-toast');
  }

  async openInvitation(partyId: string): Promise<void> {
    await this.open(`/parties/${partyId}/invite`);
  }

  design(name: string): Locator {
    return this.page.getByRole('radio', { name });
  }

  question(name: string): Locator {
    return this.page.getByRole('checkbox', { name });
  }

  counter(field: Locator): Promise<string | null> {
    return field.evaluate(
      (el) =>
        (el.getAttribute('aria-describedby') ?? '')
          .split(' ')
          .map((id) => document.getElementById(id))
          .find((n) => n?.classList.contains('field__counter'))
          ?.textContent?.trim() ?? null,
    );
  }

  fieldError(field: Locator): Promise<string | null> {
    return field.evaluate(
      (el) =>
        (el.getAttribute('aria-describedby') ?? '')
          .split(' ')
          .map((id) => document.getElementById(id))
          .find((n) => n?.classList.contains('field__error'))
          ?.textContent?.trim() ?? null,
    );
  }
}
