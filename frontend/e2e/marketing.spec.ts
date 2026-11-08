// Acceptance Test
// Traces to: L2-095
// Description: The standalone marketing site sells Giddy and hands visitors into the app
import { expect, test } from './fixtures/test';
import { MarketingPage } from './pages/marketing.page';

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
});
