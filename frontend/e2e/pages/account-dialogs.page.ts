import { Locator, Page } from '@playwright/test';

/** The change-email and delete-account dialogs from Settings. */
export class AccountDialogs {
  readonly changeEmail: Locator;
  readonly newEmail: Locator;
  readonly sendLink: Locator;
  readonly deleteAccount: Locator;
  readonly typedEmail: Locator;
  readonly confirmDelete: Locator;

  constructor(page: Page) {
    this.changeEmail = page.getByRole('dialog', { name: 'Change your email' });
    this.newEmail = this.changeEmail.getByLabel('New email');
    this.sendLink = this.changeEmail.getByRole('button', { name: 'Send confirmation link' });
    this.deleteAccount = page.getByRole('dialog', { name: 'Delete your Giddy account?' });
    this.typedEmail = this.deleteAccount.getByLabel(/Type your email/);
    this.confirmDelete = this.deleteAccount.getByRole('button', { name: 'Delete my account' });
  }
}
