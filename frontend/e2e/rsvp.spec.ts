import { expect, test } from './fixtures/test';
import { RsvpPage } from './pages/rsvp.page';

test.beforeEach(({ fakeApi }) => {
  fakeApi.session = null;
  fakeApi.guestStore.notInvitedYet();
  fakeApi.guestStore.guests.forEach((g) => (g.rsvp = 'waiting'));
});

test.describe('replying through a private link', () => {
  test('shows the invitation and a reply form with what Giddy already knows', async ({ page }) => {
    const rsvp = new RsvpPage(page);
    await rsvp.openLink('aisha-token');

    await expect(page.getByText('Private invitation for the Mohamed family')).toBeVisible();
    await expect(rsvp.invitation).toContainText('Zuri is turning 7!');
    await expect(rsvp.invitation).toContainText('Please reply by Fri 6 Nov');
    await expect(rsvp.question).toHaveText('Will Aisha come?');
    await expect(rsvp.coming).toHaveAccessibleName('Yes, Aisha’s coming!');
    await expect(rsvp.name).toHaveValue('Hodan Mohamed');
    await expect(page.getByText('Only Amara and the venue see this.')).toBeVisible();
    await expect(rsvp.note).toHaveAccessibleName(/^Note for Amara/);
    expect(await rsvp.text()).not.toContain('Arjun');
    expect(await rsvp.text()).not.toContain('Maya');
  });

  test('asks for a name and a valid mobile number', async ({ page, fakeApi }) => {
    const rsvp = new RsvpPage(page);
    await rsvp.openLink('aisha-token');

    await rsvp.coming.check();
    await rsvp.name.fill('');
    await rsvp.mobile.fill('555-01');
    await rsvp.send.click();

    await expect(rsvp.errorSummary).toContainText('Add your name so Amara knows who replied');
    await expect(rsvp.errorSummary).toContainText(
      'Enter a 10-digit mobile number, like 416-555-0177, or leave it blank',
    );
    await expect(rsvp.name).toHaveAttribute('aria-invalid', 'true');
    expect(fakeApi.guestStore.replies).toEqual([]);
  });

  test('confirms the reply, repeats the allergy and offers the calendar', async ({
    page,
    fakeApi,
  }) => {
    const rsvp = new RsvpPage(page);
    await rsvp.openLink('aisha-token');

    await rsvp.coming.check();
    await rsvp.allergies.fill('Peanut');
    await rsvp.parentStays.check();
    await rsvp.mobile.fill('416-555-0150');
    await rsvp.note.fill('Aisha can’t wait!');
    await rsvp.send.click();

    await expect(rsvp.confirmation).toContainText('Yay! Aisha is coming');
    await expect(rsvp.confirmation).toContainText(
      'Thanks, Hodan. Amara now knows about Aisha’s allergy: Peanut.',
    );
    await expect(rsvp.calendar).toHaveAttribute('href', '/api/rsvp/aisha-token/calendar.ics');
    expect(fakeApi.guestStore.replies.at(-1)).toEqual({
      coming: true,
      allergies: 'Peanut',
      parentStaying: true,
      siblings: null,
      parentName: 'Hodan Mohamed',
      mobile: '416-555-0150',
      note: 'Aisha can’t wait!',
    });
  });

  test('lets the family change their reply', async ({ page, fakeApi }) => {
    const rsvp = new RsvpPage(page);
    await rsvp.openLink('aisha-token');
    await rsvp.coming.check();
    await rsvp.send.click();
    await expect(rsvp.confirmation).toBeVisible();

    await rsvp.changeReply.click();
    await expect(rsvp.coming).toBeChecked();
    await rsvp.notComing.check();
    await rsvp.send.click();

    await expect(rsvp.confirmation).toContainText('Sorry Aisha can’t make it');
    await expect(rsvp.confirmation).toContainText('Thanks for letting Amara know.');
    expect(fakeApi.guestStore.replies.map((r) => r['coming'])).toEqual([true, false]);
  });

  test('says when a link no longer works without showing any party details', async ({ page }) => {
    const rsvp = new RsvpPage(page);
    await rsvp.openLink('revoked-token');

    await expect(page.getByRole('heading', { name: 'This link no longer works' })).toBeVisible();
    await expect(page.getByText('Ask the family who invited you to send it again.')).toBeVisible();
    expect(await rsvp.text()).not.toContain('Zuri');
  });
});

for (const width of [360, 1280]) {
  test(`the RSVP page passes accessibility checks at ${width}px`, async ({ page }) => {
    const rsvp = new RsvpPage(page);
    await rsvp.useWidth(width);
    await rsvp.openLink('aisha-token');
    await expect(rsvp.question).toBeVisible();

    expect(await rsvp.seriousAccessibilityViolations()).toEqual([]);
    expect(await rsvp.scrollsSideways()).toBe(false);
  });
}
