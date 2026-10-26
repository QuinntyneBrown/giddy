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

test('shows a sidebar with grouped navigation on wide screens', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.useWidth(1280);
  await shell.open();

  await expect(shell.sidebar).toBeVisible();
  await expect(shell.sidebarLink('Giddy')).toBeVisible();
  await expect(shell.sidebarLink('Plan a party')).toBeVisible();
  await expect(shell.sidebarGroup('Explore')).toBeVisible();
  await expect(shell.sidebarGroup('You')).toBeVisible();
  await expect(shell.bottomBar).toBeHidden();
  await expect(shell.search).toBeVisible();
});

test('shows a bottom bar with Ask Giddy in the centre on phones', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.useWidth(360);
  await shell.open();

  await expect(shell.bottomBar).toBeVisible();
  expect(await shell.bottomBarLabels()).toEqual([
    'Home',
    'Explore',
    'Ask Giddy',
    'Parties',
    'Family',
  ]);
  await expect(shell.sidebar).toBeHidden();
  await expect(shell.search).toBeHidden();
});

test('shows the search field from tablet width', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.useWidth(800);
  await shell.open();

  await expect(shell.search).toBeVisible();
  await expect(shell.bottomBar).toBeVisible();
});

for (const width of [360, 600, 800, 1000, 1280]) {
  test(`never scrolls sideways at ${width}px`, async ({ page }) => {
    const shell = new AppShellPage(page);
    await shell.useWidth(width);
    await shell.open();

    expect(await shell.scrollsSideways()).toBe(false);
  });
}

test('lets a parent switch to the dark theme and remembers it', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.preferColourScheme('light');
  await shell.open();
  await expect(shell.darkThemeToggle).toHaveAttribute('aria-pressed', 'false');

  await shell.toggleDarkTheme();

  await expect.poll(() => shell.theme()).toBe('dark');
  await expect(shell.darkThemeToggle).toHaveAttribute('aria-pressed', 'true');
  await shell.reload();
  await expect.poll(() => shell.theme()).toBe('dark');
});

test('remembers a light choice on a device that prefers dark', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.preferColourScheme('dark');
  await shell.open();

  await shell.toggleDarkTheme();
  await shell.reload();

  await expect.poll(() => shell.theme()).toBe('light');
  await expect(shell.darkThemeToggle).toHaveAttribute('aria-pressed', 'false');
});
