import { Locator, Page } from '@playwright/test';

/** Confirming before Giddy does a task, or before a task is deleted. */
export class ConfirmTaskDialog {
  readonly dialog: Locator;
  readonly confirm: Locator;
  readonly cancel: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog');
    this.confirm = this.dialog.getByRole('button', { name: /^(Send it|Delete task)$/ });
    this.cancel = this.dialog.getByRole('button', { name: 'Cancel' });
  }
}
