import { expect, test } from './fixtures/test';
import { InvitationPage } from './pages/invitation.page';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

test.describe('designing the invitation', () => {
  test.beforeEach(({ fakeApi }) => fakeApi.guestStore.notInvitedYet());

  test('starts from Giddy’s draft with a live preview', async ({ page }) => {
    const invite = new InvitationPage(page);
    await invite.openInvitation(dinoParty);

    await expect(invite.heading).toBeVisible();
    await expect(invite.subtitle).toHaveText('Not sent yet · 16 families on the guest list');
    await expect(invite.design('Dino green')).toBeChecked();
    await expect(invite.headline).toHaveValue('Zuri is turning 7!');
    expect(await invite.counter(invite.headline)).toBe('18 / 60');
    expect(await invite.counter(invite.message)).toMatch(/^\d+ \/ 280$/);
    await expect(invite.rsvpBy).toHaveValue('2026-11-06');
    await expect(page.getByText('Fri 6 Nov, 8 days before the party')).toBeVisible();
    await expect(invite.question('Allergies and dietary needs')).toBeChecked();
    await expect(invite.question('Whether a parent will stay')).toBeChecked();
    await expect(invite.question('Siblings coming along')).not.toBeChecked();
    await expect(invite.byEmail).toHaveAccessibleName(/^Email \(15 parents\)/);
    await expect(invite.byText).toHaveAccessibleName(/^Text message \(14 parents\)/);
    await expect(page.getByText('2 parents have no mobile number')).toBeVisible();
    await expect(invite.preview).toContainText('Zuri is turning 7!');
    await expect(invite.preview).toContainText('Sat 14 Nov · 1:00–3:30 pm');
    await expect(invite.preview).toContainText('Dino Den Play Café, 1124 Queen St E');
    await expect(invite.preview).toContainText('Please reply by Fri 6 Nov');
    await expect(invite.send).toHaveText('Send to 16 families');
  });

  test('updates the preview as the parent edits', async ({ page }) => {
    const invite = new InvitationPage(page);
    await invite.openInvitation(dinoParty);

    await invite.headline.fill('Dig in with Zuri!');
    await invite.design('Volcano').check();

    await expect(invite.preview).toContainText('Dig in with Zuri!');
    await expect(invite.preview).toContainText('You’re invited to erupt with fun!');
    expect(await invite.counter(invite.headline)).toBe('17 / 60');
  });

  test('blocks an RSVP-by date on or after the party', async ({ page, fakeApi }) => {
    const invite = new InvitationPage(page);
    await invite.openInvitation(dinoParty);

    await invite.rsvpBy.fill('2026-11-14');
    await invite.send.click();

    await expect
      .poll(() => invite.fieldError(invite.rsvpBy))
      .toBe('Choose an RSVP-by date before the party.');
    await expect(invite.rsvpBy).toHaveAttribute('aria-invalid', 'true');
    expect(fakeApi.guestStore.saved).toEqual([]);
    expect(fakeApi.guestStore.invitation.sentAt).toBeNull();
  });

  test('sends a test only to the parent', async ({ page, fakeApi }) => {
    const invite = new InvitationPage(page);
    await invite.openInvitation(dinoParty);

    await invite.headline.fill('Dig in with Zuri!');
    await invite.sendTest.click();

    await expect(
      invite.toasts.filter({ hasText: 'Test sent to amara.okafor@example.com' }),
    ).toBeVisible();
    expect(fakeApi.guestStore.testsSent).toBe(1);
    expect(fakeApi.guestStore.saved.at(-1)?.headline).toBe('Dig in with Zuri!');
    expect(fakeApi.guestStore.guests.every((g) => g.rsvp === 'notSent')).toBe(true);
  });
});

test.describe('sending the invitation', () => {
  test.beforeEach(({ fakeApi }) => fakeApi.guestStore.notInvitedYet());

  test('sends private links to every family and says when Giddy will remind them', async ({
    page,
    fakeApi,
  }) => {
    const invite = new InvitationPage(page);
    await invite.openInvitation(dinoParty);

    await invite.send.click();

    await expect(invite.sent).toContainText('Invites sent to 16 families');
    await expect(invite.sent).toContainText(
      'Each parent gets an email and a text with a private RSVP link, wherever we have their details. We’ll remind anyone who hasn’t replied on Tue 3 Nov.',
    );
    await expect(page.getByRole('link', { name: 'See RSVPs' })).toHaveAttribute(
      'href',
      `/parties/${dinoParty}/guests`,
    );
    expect(fakeApi.guestStore.guests.every((g) => g.rsvp === 'waiting')).toBe(true);
  });

  test('asks the parent to verify their email first', async ({ page, fakeApi }) => {
    fakeApi.session = { ...fakeApi.session!, emailVerified: false };
    const invite = new InvitationPage(page);
    await invite.openInvitation(dinoParty);

    await invite.send.click();

    await expect(invite.problem).toContainText('Verify your email before sending invitations');
    await expect(invite.problem.getByRole('link', { name: 'Verify your email' })).toBeVisible();
    expect(fakeApi.guestStore.guests.every((g) => g.rsvp === 'notSent')).toBe(true);
  });
});

test('shows what was sent once everyone is invited', async ({ page }) => {
  const invite = new InvitationPage(page);
  await invite.openInvitation(dinoParty);

  await expect(invite.subtitle).toHaveText('Sent Tue 20 Oct · 13 replied · 3 waiting');
  await expect(invite.sent).toContainText('Invites sent to 16 families');
  await expect(invite.send).toHaveCount(0);
  await expect(invite.preview).toContainText('Zuri is turning 7!');
});

test('viewers see the invitation but cannot change or send it', async ({ page, fakeApi }) => {
  fakeApi.guestStore.notInvitedYet();
  fakeApi.partyStore.parties[0].role = 'viewer';
  const invite = new InvitationPage(page);
  await invite.openInvitation(dinoParty);

  await expect(invite.preview).toContainText('Zuri is turning 7!');
  await expect(
    page.getByText('Only the party’s planners can change and send the invitation.'),
  ).toBeVisible();
  await expect(invite.send).toHaveCount(0);
  await expect(invite.headline).toHaveCount(0);
});

for (const width of [360, 1280]) {
  test(`the invitation page passes accessibility checks at ${width}px`, async ({
    page,
    fakeApi,
  }) => {
    fakeApi.guestStore.notInvitedYet();
    const invite = new InvitationPage(page);
    await invite.useWidth(width);
    await invite.openInvitation(dinoParty);
    await expect(invite.preview).toBeVisible();

    expect(await invite.seriousAccessibilityViolations()).toEqual([]);
    expect(await invite.scrollsSideways()).toBe(false);
  });
}
