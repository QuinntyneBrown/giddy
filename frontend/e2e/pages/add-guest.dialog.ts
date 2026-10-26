import { Locator, Page } from '@playwright/test';

/** Adding one family to the guest list. */
export class AddGuestDialog {
  readonly dialog: Locator;
  readonly child: Locator;
  readonly parent: Locator;
  readonly email: Locator;
  readonly mobile: Locator;
  readonly sendNow: Locator;
  readonly save: Locator;
  readonly problem: Locator;
  readonly errorSummary: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Add a guest' });
    this.child = this.dialog.getByRole('textbox', { name: 'Child’s name' });
    this.parent = this.dialog.getByRole('textbox', { name: 'Parent’s name' });
    this.email = this.dialog.getByRole('textbox', { name: 'Parent’s email' });
    this.mobile = this.dialog.getByRole('textbox', { name: /^Parent’s mobile/ });
    this.sendNow = this.dialog.getByRole('checkbox', { name: /^Send the invitation now/ });
    this.save = this.dialog.getByRole('button', { name: /^Add (and invite|guest)$/ });
    this.problem = this.dialog.getByRole('alert').filter({ hasNot: page.locator('.form-summary') });
    this.errorSummary = this.dialog.locator('giddy-error-summary');
  }
}
