import { expect, test } from './fixtures/test';
import { AppShellPage } from './pages/app-shell.page';
import { HomePage } from './pages/home.page';

test('tells the parent when they go offline and when they are back online', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.open();

  await shell.goOffline();
  await expect(shell.connectionBanner()).toContainText('You’re offline');

  await shell.goOnline();
  await expect(shell.connectionBanner()).toContainText('Back online');
  await shell.dismissConnectionBanner();
  await expect(shell.connectionBanner()).toHaveCount(0);
});

test('keeps skeletons still when the device asks for reduced motion', async ({ page, fakeApi }) => {
  fakeApi.respond('GET', '/api/parties', { body: fakeApi.parties, delayMs: 2000 });
  const home = new HomePage(page);
  await home.preferReducedMotion();
  await home.open();

  await expect(home.loading).toBeVisible();
  expect(await home.runningSkeletonAnimations()).toBe(0);
});

test('makes phone navigation targets at least 44px tall', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.useWidth(360);
  await shell.open();

  for (const target of await shell.targetSizes('navigation')) {
    expect(target.height, target.name).toBeGreaterThanOrEqual(44);
  }
});

test('makes every desktop target at least 24 by 24px', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.useWidth(1280);
  await shell.open('/missing-page');

  for (const scope of ['navigation', 'main'] as const) {
    for (const target of await shell.targetSizes(scope)) {
      expect(target.height, target.name).toBeGreaterThanOrEqual(24);
      expect(target.width, target.name).toBeGreaterThanOrEqual(24);
    }
  }
});
