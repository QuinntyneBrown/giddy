import { expect, test } from './fixtures/test';
import { NotificationsPage } from './pages/notifications.page';

const noon = '2026-10-25T16:00:00Z';

test.describe('the notification centre', () => {
  test('lists new notifications first, then earlier ones', async ({ page }) => {
    const centre = new NotificationsPage(page);
    await centre.setNow(noon);
    await centre.openNotifications();

    await expect(centre.subtitle).toHaveText('3 unread');
    await expect(centre.group('New').getByRole('listitem')).toHaveCount(3);
    await expect(centre.group('Earlier').getByRole('listitem')).toHaveCount(3);
    const reply = centre.item('Lily Chen replied');
    await expect(reply).toContainText('(unread)');
    await expect(reply).toContainText('Maya is dairy-free');
    await expect(reply).toContainText('2 h ago');
    await expect(centre.item('Dino Den confirmed')).not.toContainText('(unread)');
    await expect(centre.item('Dino Den confirmed')).toContainText('Sun 18 Oct');
  });

  test('the bell says how many are unread and follows the reads', async ({ page }) => {
    const centre = new NotificationsPage(page);
    await centre.setNow(noon);
    await centre.openNotifications();

    await expect(centre.bell()).toHaveAccessibleName('Notifications, 3 unread');
    await centre.markAll.click();

    await expect(centre.bell()).toHaveAccessibleName('Notifications');
    await expect(centre.subtitle).toHaveText('You’re all caught up');
    await expect(centre.group('New')).toHaveCount(0);
  });

  test('opening one marks it read and goes to its page', async ({ page, fakeApi }) => {
    const centre = new NotificationsPage(page);
    await centre.setNow(noon);
    await centre.openNotifications();

    await centre.item('Lily Chen replied').click();

    await expect(page).toHaveURL(/\/guests$/);
    expect(fakeApi.notificationStore.items[0].read).toBe(true);
    await expect(centre.bell()).toHaveAccessibleName('Notifications, 2 unread');
  });

  test('nothing to show explains what will appear', async ({ page, fakeApi }) => {
    fakeApi.notificationStore.items = [];
    const centre = new NotificationsPage(page);
    await centre.openNotifications();

    await expect(centre.emptyState).toContainText('Nothing new, all quiet');
    await expect(
      centre.emptyState.getByRole('link', { name: 'Choose what to hear about' }),
    ).toHaveAttribute('href', '/settings');
  });

  for (const width of [360, 1280]) {
    test(`has no serious accessibility violations at ${width}px`, async ({ page }) => {
      const centre = new NotificationsPage(page);
      await centre.useWidth(width);
      await centre.setNow(noon);
      await centre.openNotifications();
      await expect(centre.group('New')).toBeVisible();

      expect(await centre.seriousAccessibilityViolations()).toEqual([]);
    });
  }
});
