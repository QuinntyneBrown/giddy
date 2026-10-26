import { Locator, Page } from '@playwright/test';

/** Inviting planners and sharing a view-only link. */
export class SharePlanDialog {
  readonly dialog: Locator;
  readonly email: Locator;
  readonly editEverything: Locator;
  readonly viewOnly: Locator;
  readonly send: Locator;
  readonly members: Locator;
  readonly copyLink: Locator;
  readonly link: Locator;
  readonly status: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: /^Share .+ party plan$/ });
    this.email = this.dialog.getByLabel('Email');
    this.editEverything = this.dialog.getByRole('radio', { name: /^Edit everything/ });
    this.viewOnly = this.dialog.getByRole('radio', { name: /^View only/ });
    this.send = this.dialog.getByRole('button', { name: 'Send invite' });
    this.members = this.dialog.getByRole('list', { name: 'Who’s planning' });
    this.copyLink = this.dialog.getByRole('button', { name: 'Copy link' });
    this.link = this.dialog.getByLabel('View-only link');
    this.status = this.dialog.locator('[role="status"]');
  }

  remove(name: string): Locator {
    return this.dialog.getByRole('button', { name: `Remove ${name}` });
  }
}
