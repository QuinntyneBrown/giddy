import { Locator, Page } from '@playwright/test';

/** Adding or changing one of the parent's own costs. */
export class CostDialog {
  readonly dialog: Locator;
  readonly description: Locator;
  readonly category: Locator;
  readonly amount: Locator;
  readonly paid: Locator;
  readonly preview: Locator;
  readonly save: Locator;
  readonly remove: Locator;
  readonly cancel: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: /^(Add a cost|Change this cost)$/ });
    this.description = this.dialog.getByLabel('What is it?');
    this.category = this.dialog.getByLabel('Category');
    this.amount = this.dialog.getByLabel('Amount');
    this.paid = this.dialog.getByRole('checkbox', { name: 'Already paid' });
    this.preview = this.dialog.locator('p').filter({ hasText: 'After this you’ll' });
    this.save = this.dialog.getByRole('button', { name: /^(Add cost|Save changes)$/ });
    this.remove = this.dialog.getByRole('button', { name: 'Remove cost' });
    this.cancel = this.dialog.getByRole('button', { name: 'Cancel' });
  }

  async fill(cost: { description?: string; category?: string; amount?: string; paid?: boolean }) {
    if (cost.description !== undefined) await this.description.fill(cost.description);
    if (cost.category !== undefined) await this.category.selectOption(cost.category);
    if (cost.amount !== undefined) await this.amount.fill(cost.amount);
    if (cost.paid !== undefined) await this.paid.setChecked(cost.paid);
  }
}
