import { expect, test } from './fixtures/test';
import { problem } from './fixtures/fake-api';
import { HomePage } from './pages/home.page';

const fourPmInToronto = '2026-10-25T20:00:00Z';

test('greets the parent and shows the next party with a Toronto countdown', async ({ page }) => {
  const home = new HomePage(page);
  await home.setNow(fourPmInToronto);
  await home.open();

  await expect(home.greeting).toHaveText('Good afternoon, Amara');
  await expect(home.partyName('Zuri’s Dino Dig 7th')).toBeVisible();
  await expect(home.countdown).toHaveText('20 days to go');
  await expect(home.partyWhen()).toHaveText('Sat 14 Nov 2026 · 1:00–3:30 pm');
  await expect(home.partyWhen()).toHaveAttribute('datetime', '2026-11-14T13:00');
});

test('says "Tomorrow" the day before the party', async ({ page, fakeApi }) => {
  fakeApi.parties[0].daysToGo = 1;
  const home = new HomePage(page);
  await home.open();

  await expect(home.countdown).toHaveText('Tomorrow');
});

test('greets the parent by the time of day in Toronto', async ({ page }) => {
  const home = new HomePage(page);
  await home.setNow('2026-10-26T01:30:00Z');
  await home.open();

  await expect(home.greeting).toHaveText('Good evening, Amara');
});

test('shows skeletons shaped like the page while slow data loads', async ({ page, fakeApi }) => {
  fakeApi.respond('GET', '/api/parties', { body: fakeApi.parties, delayMs: 1500 });
  const home = new HomePage(page);
  await home.open();

  await expect(home.loading).toBeVisible();
  await expect(home.loading.locator('.skeleton').first()).toBeVisible();
  await expect(home.partyName('Zuri’s Dino Dig 7th')).toBeVisible();
  await expect(home.loading).toHaveCount(0);
});

test('invites a parent with no parties to plan their first one', async ({ page, fakeApi }) => {
  fakeApi.parties = [];
  const home = new HomePage(page);
  await home.open();

  await expect(home.greeting).toHaveText('Welcome to Giddy, Amara');
  await expect(home.firstPartyInvite).toBeVisible();
  await expect(home.link('Plan a party')).toHaveAttribute('href', '/parties/new');
});

test('keeps the navigation and offers Try again when the home cannot load', async ({
  page,
  fakeApi,
}) => {
  fakeApi.respond('GET', '/api/parties', {
    status: 500,
    body: problem(500, 'Something went wrong on our side.', { referenceCode: 'GDY-7Q2K' }),
  });
  const home = new HomePage(page);
  await home.useWidth(1280);
  await home.open();

  await expect(home.error).toContainText('We couldn’t load your home');
  await expect(home.error).toContainText('Your parties are safe');
  await expect(home.error).toContainText('GDY-7Q2K');
  await expect(home.sidebar).toBeVisible();

  fakeApi.respond('GET', '/api/parties', { body: fakeApi.parties });
  await home.tryAgain();
  await expect(home.partyName('Zuri’s Dino Dig 7th')).toBeVisible();
});

for (const state of ['ready', 'empty', 'error'] as const) {
  for (const width of [360, 1280]) {
    test(`home ${state} state has no serious accessibility issues at ${width}px`, async ({
      page,
      fakeApi,
    }) => {
      if (state === 'empty') fakeApi.parties = [];
      if (state === 'error')
        fakeApi.respond('GET', '/api/parties', { status: 500, body: problem(500, 'Oops') });
      const home = new HomePage(page);
      await home.useWidth(width);
      await home.open();
      await expect(home.loading).toHaveCount(0);
      await expect(home.main.locator('section').first()).toBeVisible();

      await expect(home.pageHeadings).toHaveCount(1);
      expect(await home.seriousAccessibilityViolations()).toEqual([]);
    });
  }
}
