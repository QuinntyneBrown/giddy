import { Locator, Page } from '@playwright/test';

/** The two-step delete-party dialog. */
export class DeletePartyDialog {
  readonly dialog: Locator;
  readonly cancel: Locator;
  readonly continueButton: Locator;
  readonly confirmName: Locator;
  readonly deleteButton: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: /^Delete / });
    this.cancel = this.dialog.getByRole('button', { name: 'Cancel' });
    this.continueButton = this.dialog.getByRole('button', { name: 'Continue' });
    this.confirmName = this.dialog.getByRole('textbox', { name: /to confirm/ });
    this.deleteButton = this.dialog.getByRole('button', { name: 'Delete party' });
    this.error = this.dialog.locator('.field__error');
  }

  async typeName(name: string): Promise<void> {
    await this.confirmName.fill(name);
  }
}
