import { dinoParty, zurisSixth } from './fixtures/seed-data';
import { expect, test } from './fixtures/test';
import { NewPartyPage } from './pages/new-party.page';
import { WrapUpDialogs } from './pages/wrap-up-dialogs.page';
import { WrapUpPage } from './pages/wrap-up.page';

test('before the party, wrap-up says what will be ready and when', async ({ page }) => {
  const wrapUp = new WrapUpPage(page);
  await wrapUp.openWrapUp(dinoParty.id);

  await expect(wrapUp.notOpenYet).toContainText('On Sun 15 Nov you’ll find thank-you notes');
  await expect(wrapUp.sendNotes).toHaveCount(0);
});

test.describe('thank-you notes', () => {
  test('Giddy drafts a note for every guest who came, mentioning their gift', async ({ page }) => {
    const wrapUp = new WrapUpPage(page);
    await wrapUp.openWrapUp(zurisSixth.id);

    await expect(wrapUp.drafted).toContainText('Giddy drafted 14 thank-you notes');
    await expect(wrapUp.notes.getByRole('listitem')).toHaveCount(14);
    await expect(wrapUp.note('Maya Chen')).toContainText(
      'Thank you so much for the Mermaid colouring set, Maya!',
    );
    await expect(wrapUp.note('Ava Wilson')).toContainText('No email');
    await expect(wrapUp.sendNotes).toHaveText('Send 13 notes');
  });

  test('a note is edited in a dialog, and a new gift updates Giddy’s draft', async ({
    page,
    fakeApi,
  }) => {
    const wrapUp = new WrapUpPage(page);
    await wrapUp.openWrapUp(zurisSixth.id);

    await wrapUp.editNote('Leo Rossi').click();
    const dialogs = new WrapUpDialogs(page);
    await dialogs.gift.fill('T. rex plush');
    await dialogs.saveNote.click();

    await expect(dialogs.note).toHaveCount(0);
    await expect(wrapUp.note('Leo Rossi')).toContainText(
      'Thank you so much for the T. rex plush, Leo!',
    );

    await wrapUp.editNote('Leo Rossi').click();
    await dialogs.message.fill('Leo, the T. rex sleeps in Zuri’s bed now. Thank you! Love, Zuri');
    await dialogs.saveNote.click();

    await expect(wrapUp.note('Leo Rossi')).toContainText('the T. rex sleeps in Zuri’s bed now');
    expect(fakeApi.wrapUpStore.notes.find((n) => n.childName === 'Leo Rossi')?.gift).toBe(
      'T. rex plush',
    );
  });

  test('an empty note is not saved', async ({ page }) => {
    const wrapUp = new WrapUpPage(page);
    await wrapUp.openWrapUp(zurisSixth.id);

    await wrapUp.editNote('Leo Rossi').click();
    const dialogs = new WrapUpDialogs(page);
    await dialogs.message.fill('');
    await dialogs.saveNote.click();

    await expect(dialogs.errorSummary).toBeFocused();
    await expect(dialogs.message).toHaveAccessibleDescription(
      /Write a note, or keep Giddy’s draft/,
    );
  });

  test('sending emails every note that can go and says how many went', async ({ page }) => {
    const wrapUp = new WrapUpPage(page);
    await wrapUp.openWrapUp(zurisSixth.id);

    await wrapUp.sendNotes.click();

    await expect(wrapUp.sentStatus).toContainText('13 thank-you notes sent');
    await expect(wrapUp.note('Maya Chen')).toContainText('Sent');
    await expect(wrapUp.note('Ava Wilson')).toContainText('No email');
    await expect(wrapUp.sendNotes).toHaveCount(0);
  });
});

test.describe('ratings and next year', () => {
  test('a booked business is rated with stars and an optional review', async ({
    page,
    fakeApi,
  }) => {
    const wrapUp = new WrapUpPage(page);
    await wrapUp.openWrapUp(zurisSixth.id);

    await wrapUp.stars('Splash & Giggle Pool', 5).click();

    await expect(wrapUp.stars('Splash & Giggle Pool', 5)).toHaveAttribute('aria-pressed', 'true');
    await wrapUp.addReview('Splash & Giggle Pool').click();
    const dialogs = new WrapUpDialogs(page);
    await dialogs.reviewText.fill('The lifeguards ran a mermaid relay for the kids.');
    await dialogs.saveReview.click();

    await expect(dialogs.review).toHaveCount(0);
    await expect(wrapUp.toasts).toContainText('Thanks for rating Splash & Giggle Pool');
    expect(fakeApi.wrapUpStore.providers[0]).toMatchObject({
      stars: 5,
      review: 'The lifeguards ran a mermaid relay for the kids.',
    });
  });

  test('final numbers show kids, spend and gifts', async ({ page }) => {
    const wrapUp = new WrapUpPage(page);
    await wrapUp.openWrapUp(zurisSixth.id);

    await expect(wrapUp.number('Kids')).toHaveText('14 of 16 came');
    await expect(wrapUp.number('Spent')).toHaveText('$702 · $18 under');
    await expect(wrapUp.number('Gifts logged')).toHaveText('12');
  });

  test('the plan is saved for next year and starts a new party', async ({ page, fakeApi }) => {
    const wrapUp = new WrapUpPage(page);
    await wrapUp.openWrapUp(zurisSixth.id);

    await wrapUp.saveTemplate.click();

    await expect(wrapUp.templateSaved).toContainText('Giddy will remind you in September 2027');
    await wrapUp.startFromTemplate.click();
    const newParty = new NewPartyPage(page);
    await expect(newParty.fromTemplate).toContainText('Starting from Zuri’s 6th: Mermaid Splash');
    await newParty.guests.fill('16');
    await newParty.budget.fill('850');
    await newParty.create.click();
    await expect
      .poll(() => fakeApi.partyStore.created.at(-1)?.['templateId'])
      .toBe(fakeApi.wrapUpStore.template?.templateId);
  });

  test('viewers see wrap-up but cannot send, rate or save', async ({ page, fakeApi }) => {
    fakeApi.partyStore.parties.find((p) => p.id === zurisSixth.id)!.role = 'viewer';
    const wrapUp = new WrapUpPage(page);
    await wrapUp.openWrapUp(zurisSixth.id);

    await expect(wrapUp.notes.getByRole('listitem')).toHaveCount(14);
    await expect(wrapUp.sendNotes).toHaveCount(0);
    await expect(wrapUp.editNote('Leo Rossi')).toHaveCount(0);
    await expect(wrapUp.stars('Splash & Giggle Pool', 5)).toBeDisabled();
    await expect(wrapUp.saveTemplate).toHaveCount(0);
  });

  for (const width of [360, 1280]) {
    test(`wrap-up passes accessibility checks at ${width}px`, async ({ page }) => {
      const wrapUp = new WrapUpPage(page);
      await wrapUp.useWidth(width);
      await wrapUp.openWrapUp(zurisSixth.id);
      await expect(wrapUp.notes).toBeVisible();

      expect(await wrapUp.seriousAccessibilityViolations()).toEqual([]);

      await wrapUp.editNote('Leo Rossi').click();
      await expect(new WrapUpDialogs(page).note).toBeVisible();
      expect(await wrapUp.seriousAccessibilityViolations()).toEqual([]);
    });
  }
});
