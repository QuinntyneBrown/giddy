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

  test('#watch plays the twenty-second pitch with captions off until chosen', async ({ page }) => {
    const site = new MarketingPage(page);
    await site.open();

    await expect(site.watch.getByRole('heading', { level: 2 })).toHaveText(
      'Giddy in twenty seconds',
    );
    await expect(site.video).toHaveAttribute('controls', '');
    await expect(site.video).toHaveAttribute('poster', 'meet-giddy.jpg');
    await expect(site.video).not.toHaveAttribute('autoplay');
    expect(await site.captionTracks()).toEqual([
      { kind: 'captions', srclang: 'en', label: 'English', isDefault: false, mode: 'disabled' },
    ]);
    const duration = await site.videoDuration();
    expect(duration).toBeGreaterThan(18);
    expect(duration).toBeLessThan(23);
    expect(await site.isPaused()).toBe(true);

    await expect(site.transcript.getByText('Start planning free.')).toBeHidden();
    await site.openTranscript();
    await expect(site.transcript.getByText('Planning a kid’s party in the GTA?')).toBeVisible();
    await expect(site.transcript.getByText('Start planning free.')).toBeVisible();
    expect(await site.accessibilityViolations('#watch')).toEqual([]);
  });

  test('#watch falls back to the poster and the transcript when the video cannot play', async ({
    page,
  }) => {
    const site = new MarketingPage(page);
    await site.breakTheVideo();
    await site.open();

    await expect(site.videoUnavailable).toBeVisible();
    await expect(
      site.videoUnavailable.getByRole('link', { name: 'Read the transcript' }),
    ).toHaveAttribute('href', /#/);
    await expect(site.posterStill).toBeVisible();
    await expect(site.transcript).toHaveAttribute('open', '');
    await expect(
      site.transcript.getByText('Then invites, RSVPs and a run sheet for the day.'),
    ).toBeVisible();
    expect(await site.accessibilityViolations('#watch')).toEqual([]);
  });
});
