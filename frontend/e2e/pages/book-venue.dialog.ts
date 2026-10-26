import { Locator, Page } from '@playwright/test';

/** The book-a-venue dialog: details, the deposit, and every outcome. */
export class BookVenueDialog {
  readonly dialog: Locator;
  readonly summary: Locator;
  readonly bookingName: Locator;
  readonly mobile: Locator;
  readonly child: Locator;
  readonly notes: Locator;
  readonly addCard: Locator;
  readonly testCard: Locator;
  readonly saveCard: Locator;
  readonly pay: Locator;
  readonly cancel: Locator;
  readonly errorSummary: Locator;
  readonly problem: Locator;
  readonly alternatives: Locator;
  readonly bankCheck: Locator;
  readonly approve: Locator;
  readonly finishLater: Locator;
  readonly close: Locator;
  readonly backToPlan: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog');
    this.summary = this.dialog.locator('.well');
    this.bookingName = this.dialog.getByRole('textbox', { name: 'Name for the booking' });
    this.mobile = this.dialog.getByRole('textbox', { name: 'Mobile' });
    this.child = this.dialog.getByRole('textbox', { name: 'Birthday child' });
    this.notes = this.dialog.getByRole('textbox', { name: /Notes for the venue/ });
    this.addCard = this.dialog.getByRole('radio', { name: /^Add a card/ });
    this.testCard = this.dialog.getByRole('combobox', { name: 'Card' });
    this.saveCard = this.dialog.getByRole('checkbox', { name: /Save this card/ });
    this.pay = this.dialog.getByRole('button', { name: /^Pay \$|^Try again/ });
    this.cancel = this.dialog.getByRole('button', { name: 'Cancel', exact: true });
    this.errorSummary = this.dialog.locator('giddy-error-summary');
    this.problem = this.dialog.getByRole('alert').filter({ hasNot: page.locator('.form-summary') });
    this.alternatives = this.dialog.getByRole('list', { name: 'Still free' }).getByRole('listitem');
    this.bankCheck = this.dialog.getByRole('region', { name: 'Your bank’s check' });
    this.approve = this.bankCheck.getByRole('button', { name: 'Approve' });
    this.finishLater = this.dialog.getByRole('button', { name: 'Finish later' });
    this.close = this.dialog.getByRole('button', { name: 'Close', exact: true }).last();
    this.backToPlan = this.dialog.getByRole('link', { name: 'Back to the plan' });
  }

  heading(name: string | RegExp): Locator {
    return this.dialog.getByRole('heading', { name });
  }

  savedCard(name: string): Locator {
    return this.dialog.getByRole('radio', { name: new RegExp(`^${name}`) });
  }

  fieldError(field: Locator): Promise<string | null> {
    return field.evaluate((el) => {
      const ids = (el.getAttribute('aria-describedby') ?? '').split(' ');
      return ids.map((id) => document.getElementById(id)?.textContent?.trim()).join(' ') || null;
    });
  }

  bookAlternative(time: string): Promise<void> {
    return this.dialog.getByRole('button', { name: `Book ${time}` }).click();
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }
}
