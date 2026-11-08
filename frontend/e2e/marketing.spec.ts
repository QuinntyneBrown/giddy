// Acceptance Test
// Traces to: L2-095
// Description: The standalone marketing site sells Giddy and hands visitors into the app
import { expect, test } from './fixtures/test';
import { APP_ORIGIN, MarketingPage } from './pages/marketing.page';

test.describe('Marketing site', () => {
  test('shows the pitch page at / without calling the Giddy API', async ({ page }) => {
    const site = new MarketingPage(page);
    await site.open('/');

    await expect(site.body).toHaveAttribute('data-page', 'marketing');
    await expect(site.main).toBeVisible();
    await expect(site.heroHeading).toHaveText(
      'Parties they’ll flip for. Planning you won’t flip over.',
    );
    expect(site.requestsToApi()).toEqual([]);
  });

  test('the header leads to the sections, back to the top and into the app', async ({ page }) => {
    const site = new MarketingPage(page);
    await site.useWidth(1280);
    await site.open();

    await expect(site.logoLink).toHaveAttribute('href', '#top');
    expect(await site.sectionLinks()).toEqual([
      { name: 'How it works', href: '#how' },
      { name: 'Themes', href: '#themes' },
      { name: 'For parents', href: '#parents' },
      { name: 'Where we plan', href: '#where' },
    ]);
    await expect(site.headerLink('Sign in')).toHaveAttribute('href', `${APP_ORIGIN}/sign-in`);
    await expect(site.headerLink('Start planning free')).toHaveAttribute(
      'href',
      `${APP_ORIGIN}/sign-up`,
    );
  });

  test('keeps the header to Sign in on narrow phones', async ({ page }) => {
    const site = new MarketingPage(page);
    await site.useWidth(390);
    await site.open();

    await expect(site.headerLink('Sign in')).toBeVisible();
    await expect(site.headerLink('Start planning free')).toBeHidden();
  });

  test('the hero starts a plan in the app or jumps to the video', async ({ page }) => {
    const site = new MarketingPage(page);
    await site.open();

    await expect(site.heroLink('Start planning free')).toHaveAttribute(
      'href',
      `${APP_ORIGIN}/sign-up`,
    );
    await expect(site.heroLink('Watch the 20-second tour')).toHaveAttribute('href', '#watch');
    await expect(
      site.heroText('Free to plan · No credit card · Venues and vendors across the GTA'),
    ).toBeVisible();
  });
});
