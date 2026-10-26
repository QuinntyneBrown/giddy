import { expect, test } from './fixtures/test';
import { AppShellPage } from './pages/app-shell.page';

test('provides accessible application landmarks and responsive navigation', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.open();

  await expect(shell.skipLink).toBeAttached();
  await expect(shell.banner).toBeVisible();
  await expect(shell.primaryNavigation).toBeVisible();
  await expect(shell.main).toBeVisible();
  await expect(shell.footer).toBeVisible();
  await expect(shell.pageHeadings).toHaveCount(1);

  await shell.useWidth(360);
  await expect(shell.primaryNavigation).toBeVisible();
});

test('moves keyboard focus to main content through the skip link', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.open();

  await shell.skipToContent();

  await expect(shell.main).toBeFocused();
});

test('uses the system dark theme when no preference is saved', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.preferColourScheme('dark');
  await shell.open();

  await expect.poll(() => shell.theme()).toBe('dark');
});

test('uses a saved theme choice ahead of the system preference', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.preferColourScheme('dark');
  await shell.saveThemeBeforeLoad('light');
  await shell.open();

  await expect.poll(() => shell.theme()).toBe('light');
});

test('declares Canadian English for GTA parents', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.open();

  await expect.poll(() => shell.language()).toBe('en-CA');
});

test('has no serious or critical accessibility violations', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.open();

  expect(await shell.seriousAccessibilityViolations()).toEqual([]);
});
