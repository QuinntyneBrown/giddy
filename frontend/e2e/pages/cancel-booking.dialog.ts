import { Locator, Page } from '@playwright/test';

/** Confirming a booking's cancellation, with what happens to the deposit. */
export class CancelBookingDialog {
  readonly dialog: Locator;
  readonly keep: Locator;
  readonly confirm: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: /^Cancel the / });
    this.keep = this.dialog.getByRole('button', { name: 'Keep booking' });
    this.confirm = this.dialog.getByRole('button', { name: /^Cancel (and refund|without)/ });
  }
}
