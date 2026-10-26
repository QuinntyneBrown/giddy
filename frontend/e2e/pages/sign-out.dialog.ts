import { Locator, Page } from '@playwright/test';

/** Confirming signing out. */
export class SignOutDialog {
  readonly dialog: Locator;
  readonly signOut: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Sign out of Giddy?' });
    this.signOut = this.dialog.getByRole('button', { name: 'Sign out' });
  }
}
