import { Locator, Page } from '@playwright/test';

/** Editing a thank-you note and reviewing a business, from Wrap-up. */
export class WrapUpDialogs {
  readonly note: Locator;
  readonly gift: Locator;
  readonly message: Locator;
  readonly saveNote: Locator;
  readonly errorSummary: Locator;
  readonly review: Locator;
  readonly reviewText: Locator;
  readonly saveReview: Locator;

  constructor(page: Page) {
    this.note = page.getByRole('dialog', { name: /^Thank-you note to / });
    this.gift = this.note.getByLabel(/^What .+ gave/);
    this.message = this.note.getByRole('textbox', { name: 'Note' });
    this.saveNote = this.note.getByRole('button', { name: 'Save note' });
    this.errorSummary = page.locator('giddy-error-summary');
    this.review = page.getByRole('dialog', { name: /^Review / });
    this.reviewText = this.review.getByLabel(/^Your review/);
    this.saveReview = this.review.getByRole('button', { name: 'Save review' });
  }
}
