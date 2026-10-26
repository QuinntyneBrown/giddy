import { expect, test } from './fixtures/test';
import { problem } from './fixtures/fake-api';
import { HomePage } from './pages/home.page';

const fourPmInToronto = '2026-10-25T20:00:00Z';

test('greets the parent and summarises what is in progress', async ({ page }) => {
  const home = new HomePage(page);
  await home.setNow(fourPmInToronto);
  await home.open();

  await expect(home.greeting).toHaveText('Good afternoon, Amara');
  await expect(home.subtitle).toHaveText(
    '2 parties in progress · 2 things need you this week · 0 of 16 guests coming',
  );
});

test('shows the soonest party with its countdown, readiness and next step', async ({ page }) => {
  const home = new HomePage(page);
  await home.open();

  await expect(home.partyName('Zuri’s Dino Dig 7th')).toBeVisible();
  await expect(home.countdown).toHaveText('20 days to go');
  await expect(home.partyWhen()).toHaveText('Sat 14 Nov 2026 · 1:00–3:30 pm');
  await expect(home.nextParty).toContainText('Dino Den Play Café');
  await expect(home.nextParty).toContainText('16 kids');
  await expect(home.readiness).toHaveAccessibleName('Plan 27% ready');
  await expect(home.nextParty).toContainText(
    '4 of 15 steps done · next: Book Professor Fizz’s Volcano Lab',
  );
  await expect(home.link('Open plan')).toHaveAttribute(
    'href',
    '/parties/3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6',
  );
  await expect(home.nextParty.getByRole('link', { name: 'Ask Giddy' })).toBeVisible();
});

test('says "Tomorrow" the day before the party', async ({ page, fakeApi }) => {
  fakeApi.partyStore.parties[0].daysToGo = 1;
  const home = new HomePage(page);
  await home.open();

  await expect(home.countdown).toHaveText('Tomorrow');
});

test('lists Giddy’s nudges, overdue first, each with one action', async ({ page }) => {
  const home = new HomePage(page);
  await home.open();

  await expect(home.nudgeItems()).toHaveCount(2);
  await expect(home.nudgeItems().first()).toContainText('Book the entertainer');
  await expect(home.nudgeItems().first()).toContainText('Overdue');
  await expect(home.nudgeItems().first()).toContainText('It was due Tue 20 Oct.');
  await expect(home.nudgeItems().nth(1)).toContainText('Needs you');
  await expect(
    home.nudgeItems().first().getByRole('link', { name: 'Open the plan' }),
  ).toBeVisible();
});

test('keeps the rest of Home working when only the nudges fail', async ({ page, fakeApi }) => {
  fakeApi.respond('GET', '/api/home/nudges', { status: 500, body: problem(500, 'Oops') });
  const home = new HomePage(page);
  await home.open();

  await expect(home.nudgesWarning()).toContainText('Nudges didn’t load');
  await expect(home.partyName('Zuri’s Dino Dig 7th')).toBeVisible();
  await expect(home.quickStart).toBeVisible();

  fakeApi.respond('GET', '/api/home/nudges', () => ({ body: fakeApi.partyStore.nudges }));
  await home.retryNudges();
  await expect(home.nudgeItems()).toHaveCount(2);
});

test('shows RSVPs, quick start links and the next birthday', async ({ page }) => {
  const home = new HomePage(page);
  await home.open();

  await expect(home.rsvps).toContainText('Coming');
  await expect(home.rsvps).toContainText('1 allergy to plan for');
  for (const name of ['Ask Giddy', 'Find a venue', 'Browse themes', 'Guest list']) {
    await expect(home.quickStart.getByRole('link', { name })).toBeVisible();
  }
  await expect(home.comingUpNext).toContainText('Kofi turns 4');
  await expect(home.comingUpNext).toContainText('Wed 3 Feb 2027 · in 101 days');
  await expect(
    home.comingUpNext.getByRole('link', { name: 'Start Kofi’s plan early' }),
  ).toHaveAttribute('href', '/parties/new?child=11111111-2222-4333-8444-000000000002');
});

test('shows skeletons shaped like the page while slow data loads', async ({ page, fakeApi }) => {
  fakeApi.respond('GET', '/api/home', () => ({ body: fakeApi.partyStore.home(), delayMs: 1500 }));
  const home = new HomePage(page);
  await home.open();

  await expect(home.loading.first()).toBeVisible();
  await expect(home.loading.locator('.skeleton').first()).toBeVisible();
  await expect(home.partyName('Zuri’s Dino Dig 7th')).toBeVisible();
});

test('welcomes a parent with no parties and offers one primary action', async ({
  page,
  fakeApi,
}) => {
  fakeApi.partyStore.parties = [];
  fakeApi.partyStore.nudges = [];
  const home = new HomePage(page);
  await home.open();

  await expect(home.greeting).toHaveText('Welcome to Giddy, Amara');
  await expect(home.firstPartyInvite).toBeVisible();
  await expect(home.link('Plan a party')).toHaveAttribute('href', '/parties/new');
  await expect(home.link('Add my kids first')).toBeVisible();
  for (const name of ['Browse themes', 'Venues near me', 'Entertainers', 'Just chat']) {
    await expect(home.link(name)).toBeVisible();
  }
});

test('keeps the navigation and offers Try again when Home cannot load', async ({
  page,
  fakeApi,
}) => {
  fakeApi.respond('GET', '/api/home', {
    status: 500,
    body: problem(500, 'Something went wrong on our side.', { referenceCode: 'GDY-7Q2K' }),
  });
  const home = new HomePage(page);
  await home.useWidth(1280);
  await home.open();

  await expect(home.error).toContainText('Your parties are safe');
  await expect(home.error).toContainText('GDY-7Q2K');
  await expect(home.sidebar).toBeVisible();

  fakeApi.respond('GET', '/api/home', () => ({ body: fakeApi.partyStore.home() }));
  await home.tryAgain();
  await expect(home.partyName('Zuri’s Dino Dig 7th')).toBeVisible();
});

for (const state of ['ready', 'empty', 'error'] as const) {
  for (const width of [360, 1280]) {
    test(`home ${state} state has no serious accessibility issues at ${width}px`, async ({
      page,
      fakeApi,
    }) => {
      if (state === 'empty') fakeApi.partyStore.parties = [];
      if (state === 'error')
        fakeApi.respond('GET', '/api/home', { status: 500, body: problem(500, 'Oops') });
      const home = new HomePage(page);
      await home.useWidth(width);
      await home.open();
      await expect(home.main.locator('section').first()).toBeVisible();
      await expect(home.loading).toHaveCount(0);

      await expect(home.pageHeadings).toHaveCount(1);
      expect(await home.seriousAccessibilityViolations()).toEqual([]);
      expect(await home.scrollsSideways()).toBe(false);
    });
  }
}
