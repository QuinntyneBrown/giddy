import { Locator, Page } from '@playwright/test';

/** The confirmation dialog shown before Giddy's plan changes the party. */
export class AcceptPlanDialog {
  readonly dialog: Locator;
  readonly changes: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: /Use this plan for/ });
    this.changes = this.dialog.getByRole('listitem');
    this.error = this.dialog.getByRole('alert');
  }

  async confirm(): Promise<void> {
    await this.dialog.getByRole('button', { name: 'Use this plan' }).click();
  }

  async tryAgain(): Promise<void> {
    await this.dialog.getByRole('button', { name: 'Try again' }).click();
  }

  async cancel(): Promise<void> {
    await this.dialog.getByRole('button', { name: 'Cancel' }).click();
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async pressTab(): Promise<void> {
    await this.page.keyboard.press('Tab');
  }

  /** Where the dialog sits: flush with the bottom edge (a sheet) or centred. */
  async placement(): Promise<'bottom-sheet' | 'centred' | 'other'> {
    const box = await this.dialog.boundingBox();
    const viewport = this.page.viewportSize();
    if (!box || !viewport) return 'other';
    if (Math.abs(box.y + box.height - viewport.height) < 2 && box.width >= viewport.width - 1)
      return 'bottom-sheet';
    const left = box.x;
    const right = viewport.width - (box.x + box.width);
    return Math.abs(left - right) < 2 ? 'centred' : 'other';
  }

  focusIsInside(): Promise<boolean> {
    return this.dialog.evaluate((dialog) => dialog.contains(document.activeElement));
  }
}
