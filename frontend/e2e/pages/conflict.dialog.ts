import { Locator, Page } from '@playwright/test';

/** Choosing between a change made offline and a co-planner's. */
export class ConflictDialog {
  readonly dialog: Locator;
  readonly keepMine: Locator;
  readonly keepTheirs: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Which version should Giddy keep?' });
    this.keepMine = this.dialog.getByRole('button', { name: 'Keep mine' });
    this.keepTheirs = this.dialog.getByRole('button', { name: /^Keep \w+’s$/ });
  }
}
