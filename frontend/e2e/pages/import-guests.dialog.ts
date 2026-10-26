import { Locator, Page } from '@playwright/test';

/** Importing a class list or reusing another party's guests. */
export class ImportGuestsDialog {
  readonly dialog: Locator;
  readonly spreadsheet: Locator;
  readonly contacts: Locator;
  readonly importButton: Locator;
  readonly warning: Locator;
  readonly problem: Locator;
  readonly progress: Locator;
  readonly done: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Import guests' });
    this.spreadsheet = this.dialog.getByRole('radio', { name: /^Spreadsheet/ });
    this.contacts = this.dialog.getByRole('radio', { name: /^Phone contacts/ });
    this.importButton = this.dialog.getByRole('button', { name: /^Import/ });
    this.warning = this.dialog.locator('.alert--warning');
    this.problem = this.dialog.getByRole('alert');
    this.progress = this.dialog.getByRole('progressbar', { name: 'Importing guests' });
    this.done = this.dialog.getByRole('button', { name: 'Done' });
  }

  source(name: string): Locator {
    return this.dialog.getByRole('radio', { name: new RegExp(`^${name}`) });
  }

  async chooseFile(name: string, content: string): Promise<void> {
    await this.dialog
      .locator('input[type=file]')
      .setInputFiles({ name, mimeType: 'text/csv', buffer: Buffer.from(content) });
  }
}
