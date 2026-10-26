import { Locator, Page } from '@playwright/test';

/** Asking a vendor for a quote. */
export class RequestQuoteDialog {
  readonly dialog: Locator;
  readonly date: Locator;
  readonly start: Locator;
  readonly kids: Locator;
  readonly where: Locator;
  readonly message: Locator;
  readonly send: Locator;
  readonly done: Locator;
  readonly problem: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: /^(Ask .* for a quote|Request sent)/ });
    this.date = this.dialog.getByLabel('Date');
    this.start = this.dialog.getByLabel('Start time');
    this.kids = this.dialog.getByRole('spinbutton', { name: 'Kids' });
    this.where = this.dialog.getByRole('textbox', { name: 'Where' });
    this.message = this.dialog.getByRole('textbox', { name: 'Message' });
    this.send = this.dialog.getByRole('button', { name: 'Send request' });
    this.done = this.dialog.getByRole('button', { name: 'Done' });
    this.problem = this.dialog.getByRole('alert');
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
