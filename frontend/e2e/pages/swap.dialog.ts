import { Locator, Page } from '@playwright/test';

/** Confirming one of Giddy's swaps to get back within budget. */
export class SwapDialog {
  readonly dialog: Locator;
  readonly confirm: Locator;
  readonly cancel: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: /^Swap / });
    this.confirm = this.dialog.getByRole('button', { name: /^Swap to / });
    this.cancel = this.dialog.getByRole('button', { name: 'Keep the plan' });
  }
}
