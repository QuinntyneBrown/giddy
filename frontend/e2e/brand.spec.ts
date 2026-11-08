import { expect, test } from './fixtures/test';
import { AppShellPage } from './pages/app-shell.page';
import { MARKETING_ORIGIN, MarketingPage } from './pages/marketing.page';
import { SiteIconsPage } from './pages/site-icons.page';

// L2-096: the giddy wordmark is the brand in the app's top bar and sidebar.

test('shows the giddy wordmark as the top bar brand on phones', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.useWidth(390);
  await shell.open();

  await expect(shell.wordmarkIn(shell.topBarBrand)).toBeVisible();
  expect(await shell.visibleTextOf(shell.topBarBrand)).toBe('');
});

test('shows the giddy wordmark as the sidebar brand on wide screens', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.useWidth(1280);
  await shell.open();

  await expect(shell.wordmarkIn(shell.sidebarBrand)).toBeVisible();
  expect(await shell.visibleTextOf(shell.sidebarBrand)).toBe('');
});

test('colours the wordmark grape and pink in the light theme', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.useWidth(390);
  await shell.preferColourScheme('light');
  await shell.open();

  await expect(shell.wordmarkIn(shell.topBarBrand)).toBeVisible();
  expect(await shell.wordmarkColours(shell.topBarBrand)).toEqual({
    ink: 'rgb(90, 34, 196)',
    tittle: 'rgb(255, 111, 168)',
  });
});

test('turns the wordmark letters cream in the dark theme and keeps the pink balloon', async ({
  page,
}) => {
  const shell = new AppShellPage(page);
  await shell.useWidth(390);
  await shell.preferColourScheme('dark');
  await shell.open();

  await expect(shell.wordmarkIn(shell.topBarBrand)).toBeVisible();
  expect(await shell.wordmarkColours(shell.topBarBrand)).toEqual({
    ink: 'rgb(255, 249, 241)',
    tittle: 'rgb(255, 111, 168)',
  });
});

test('shows the giddy wordmark in the marketing site header', async ({ page }) => {
  const site = new MarketingPage(page);
  await site.useWidth(390);
  await site.open();

  await expect(site.logoWordmark).toBeVisible();
});

for (const [site, url] of [
  ['the app', '/'],
  ['the marketing site', `${MARKETING_ORIGIN}/`],
] as const) {
  test(`declares the app icon as the favicon and touch icon on ${site}`, async ({ page }) => {
    const icons = new SiteIconsPage(page);
    await icons.open(url);

    expect(await icons.declaredIcons()).toEqual([
      expect.objectContaining({
        rel: 'icon',
        href: '/favicon.svg',
        type: 'image/svg+xml',
        status: 200,
        contentType: expect.stringContaining('image/svg+xml'),
      }),
      expect.objectContaining({ rel: 'icon', href: '/favicon.ico', sizes: '48x48', status: 200 }),
      expect.objectContaining({
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
        status: 200,
        contentType: expect.stringContaining('image/png'),
      }),
    ]);
  });
}
