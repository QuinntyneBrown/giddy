import { Locator, Page } from '@playwright/test';

/** Adding or changing a child. */
export class AddChildDialog {
  readonly dialog: Locator;
  readonly firstName: Locator;
  readonly birthday: Locator;
  readonly allergies: Locator;
  readonly save: Locator;
  readonly remove: Locator;
  readonly problem: Locator;
  readonly interestsHint: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: /^(Add a child|Change .+)$/ });
    this.firstName = this.dialog.getByLabel('First name');
    this.birthday = this.dialog.getByLabel('Birthday');
    this.allergies = this.dialog.getByLabel(/Allergies or needs/);
    this.save = this.dialog.getByRole('button', { name: /^(Add|Save|Try again)/ });
    this.remove = this.dialog.getByRole('button', { name: /^Remove / });
    this.problem = this.dialog.locator('[giddy-alert]');
    this.interestsHint = this.dialog.getByRole('group', { name: 'Favourite things' });
  }

  interest(name: string): Locator {
    return this.dialog.getByRole('checkbox', { name });
  }
}
