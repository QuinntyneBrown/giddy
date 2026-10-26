import { expect, test } from './fixtures/test';
import { HomePage } from './pages/home.page';
import { InvitationPage } from './pages/invitation.page';
import { PushPrompt } from './pages/push-prompt.page';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';
const day = 24 * 60 * 60 * 1000;

test.beforeEach(({ fakeApi }) => fakeApi.guestStore.notInvitedYet());

test('explains push only once the first invitations are sent', async ({ page }) => {
  const push = new PushPrompt(page);
  await push.browserWillAnswer('granted');
  const invite = new InvitationPage(page);
  await invite.openInvitation(dinoParty);
  await expect(push.ask).toHaveCount(0);

  await invite.send.click();

  await expect(push.ask).toContainText('Turn on notifications for RSVPs and party-day reminders');
  expect(await push.browserAsks()).toBe(0);
  await push.turnOn.click();
  await expect(push.turnedOn).toContainText('Quiet hours are 9 pm to 7 am');
  expect(await push.browserAsks()).toBe(1);
  await expect(push.ask).toHaveCount(0);
});

test('a blocked browser explains how to allow notifications', async ({ page }) => {
  const push = new PushPrompt(page);
  await push.browserWillAnswer('denied');
  const invite = new InvitationPage(page);
  await invite.openInvitation(dinoParty);
  await invite.send.click();

  await push.turnOn.click();

  await expect(push.blocked).toContainText('open your browser’s site settings');
  await expect(push.showMeHow).toHaveAttribute('href', '/help');
});

test('“Not now” keeps the prompt away for 30 days', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-25T12:00:00') });
  const push = new PushPrompt(page);
  await push.browserWillAnswer('granted');
  const invite = new InvitationPage(page);
  await invite.openInvitation(dinoParty);
  await invite.send.click();

  await push.notNow.click();
  await expect(push.ask).toHaveCount(0);

  const home = new HomePage(page);
  await page.clock.setSystemTime(new Date(Date.parse('2026-10-25T12:00:00') + 29 * day));
  await home.open();
  await expect(home.main).toBeVisible();
  await expect(push.ask).toHaveCount(0);

  await page.clock.setSystemTime(new Date(Date.parse('2026-10-25T12:00:00') + 31 * day));
  await home.open();
  await expect(push.ask).toBeVisible();
});
