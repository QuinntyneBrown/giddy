import { expect, test } from './fixtures/test';
import { MarketingPage } from './pages/marketing.page';
import { MascotPage } from './pages/mascot.page';
import { SystemStatePage } from './pages/system-state.page';

// L2-097: Giddy the balloon is drawn as in the Magic Patterns brand guidelines and named for its mood.

test('a missing page shows Giddy looking sleepy, sky blue with a night face', async ({ page }) => {
  const giddy = new MascotPage(page);
  await giddy.preferColourScheme('light');
  await new SystemStatePage(page).open('/missing-page');

  const sleepy = giddy.named('Giddy looking sleepy');
  await expect(sleepy).toBeVisible();
  expect(await giddy.colours(sleepy)).toEqual({
    balloon: 'rgb(76, 184, 255)',
    face: 'rgb(19, 14, 34)',
  });
});

test('a server error shows Giddy looking worried, orange with a night face', async ({ page }) => {
  const giddy = new MascotPage(page);
  await giddy.preferColourScheme('light');
  await new SystemStatePage(page).open('/500?ref=GDY-5XR1');

  const worried = giddy.named('Giddy looking worried');
  await expect(worried).toBeVisible();
  expect(await giddy.colours(worried)).toEqual({
    balloon: 'rgb(255, 138, 61)',
    face: 'rgb(19, 14, 34)',
  });
});

test('the marketing hero shows Giddy looking ready to party, grape with a cream face', async ({
  page,
}) => {
  const giddy = new MascotPage(page);
  await giddy.preferColourScheme('light');
  await new MarketingPage(page).open();

  const party = giddy.named('Giddy looking ready to party');
  await expect(party).toBeVisible();
  expect(await giddy.colours(party)).toEqual({
    balloon: 'rgb(108, 47, 224)',
    face: 'rgb(255, 249, 241)',
  });
});

test('in the dark theme the party balloon turns light grape with a deep grape face', async ({
  page,
}) => {
  const giddy = new MascotPage(page);
  await giddy.preferColourScheme('dark');
  await new MarketingPage(page).open();

  const party = giddy.named('Giddy looking ready to party');
  await expect(party).toBeVisible();
  expect(await giddy.colours(party)).toEqual({
    balloon: 'rgb(187, 157, 255)',
    face: 'rgb(29, 11, 69)',
  });
});
