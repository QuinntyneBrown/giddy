import { Locator, Page } from '@playwright/test';

/** Confirming a guest's removal. */
export class RemoveGuestDialog {
  readonly dialog: Locator;
  readonly cancel: Locator;
  readonly remove: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: /^Remove / });
    this.cancel = this.dialog.getByRole('button', { name: 'Cancel' });
    this.remove = this.dialog.getByRole('button', { name: /^Remove / });
  }
}
