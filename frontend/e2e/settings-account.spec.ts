import { amara } from './fixtures/seed-data';
import { expect, test } from './fixtures/test';
import { AccountDialogs } from './pages/account-dialogs.page';
import { SettingsPage } from './pages/settings.page';

test.describe('profile and email', () => {
  test('saves the profile and the channels with one button', async ({ page, fakeApi }) => {
    const settings = new SettingsPage(page);
    await settings.openSettings();

    await settings.mobile.fill('647-555-0199');
    await settings.channel('Giddy’s reminders by email').uncheck();
    await settings.save.click();

    await expect(settings.status).toContainText('Your settings are saved');
    expect(fakeApi.settingsStore.settings.mobile).toBe('647-555-0199');
    expect(fakeApi.settingsStore.settings.notifications['reminders'].email).toBe(false);
  });

  test('an incomplete mobile or postal code saves nothing', async ({ page, fakeApi }) => {
    const settings = new SettingsPage(page);
    await settings.openSettings();

    await settings.mobile.fill('416-555');
    await settings.postalCode.fill('12345');
    await settings.save.click();

    await expect(settings.errorSummary).toBeFocused();
    await expect(settings.mobile).toHaveAccessibleDescription(/Enter a Canadian mobile number/);
    await expect(settings.postalCode).toHaveAccessibleDescription(/Enter a Canadian postal code/);
    expect(fakeApi.settingsStore.settings.mobile).toBe('416-555-0131');
  });

  test('a new email waits for confirmation', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.openSettings();

    await settings.changeEmail.click();
    const dialogs = new AccountDialogs(page);
    await dialogs.newEmail.fill('amara.new@example.com');
    await dialogs.sendLink.click();

    await expect(dialogs.changeEmail).toHaveCount(0);
    await expect(page.locator('main')).toContainText(
      'Waiting for you to confirm amara.new@example.com',
    );
    await expect(page.locator('main')).toContainText(amara.email);
  });

  test('quiet hours change straight away, without saving', async ({ page, fakeApi }) => {
    const settings = new SettingsPage(page);
    await settings.openSettings();

    await settings.quietHours.uncheck();

    await expect.poll(() => fakeApi.settingsStore.quietHoursChanges).toEqual([false]);
    await expect(settings.quietHours).not.toBeChecked();
  });
});

test.describe('your data', () => {
  test('download emails a link to the data', async ({ page, fakeApi }) => {
    const settings = new SettingsPage(page);
    await settings.openSettings();

    await settings.download.click();

    await expect(settings.status).toContainText('We’ll email you a link');
    expect(fakeApi.settingsStore.exports).toBe(1);
  });

  test('deleting warns about bookings, needs the email typed, and signs out', async ({
    page,
    fakeApi,
  }) => {
    const settings = new SettingsPage(page);
    await settings.openSettings();

    await settings.deleteAccount.click();
    const dialogs = new AccountDialogs(page);
    await expect(dialogs.deleteAccount).toContainText('1 booking isn’t cancelled');
    await dialogs.typedEmail.fill('someone@example.com');
    await dialogs.confirmDelete.click();
    await expect(dialogs.typedEmail).toHaveAccessibleDescription(/Type the email you sign in with/);
    await dialogs.typedEmail.fill(amara.email);
    await dialogs.confirmDelete.click();

    await expect(page).toHaveURL(/\/sign-in/);
    expect(fakeApi.settingsStore.deleted).toBe(true);
  });

  for (const width of [360, 1280]) {
    test(`settings has no serious accessibility violations at ${width}px`, async ({ page }) => {
      const settings = new SettingsPage(page);
      await settings.useWidth(width);
      await settings.openSettings();
      await expect(settings.channels).toBeVisible();

      expect(await settings.seriousAccessibilityViolations()).toEqual([]);
    });
  }
});
