import { expect, test } from './fixtures/test';
import { SettingsPage } from './pages/settings.page';

test('lists what Giddy remembers and forgets a memory on request', async ({ page, fakeApi }) => {
  const settings = new SettingsPage(page);
  await settings.openSettings();

  await expect(settings.memories.locator('.chip')).toHaveCount(3);
  await settings.forget('You prefer venues with parking');

  await expect(settings.memory('You prefer venues with parking')).toHaveCount(0);
  expect(fakeApi.planner.memories.map((m) => m.text)).not.toContain(
    'You prefer venues with parking',
  );
});

for (const width of [360, 1280]) {
  test(`settings has no serious accessibility issues at ${width}px`, async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.useWidth(width);
    await settings.openSettings();
    await expect(settings.memories).toBeVisible();

    expect(await settings.seriousAccessibilityViolations()).toEqual([]);
  });
}
