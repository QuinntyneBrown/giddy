import { expect, test } from './fixtures/test';
import { SystemStatePage } from './pages/system-state.page';

test('explains an unknown route in plain words with ways back', async ({ page }) => {
  const state = new SystemStatePage(page);
  await state.open('/missing-page');

  await expect(state.heading('This page floated away')).toBeVisible();
  await expect(state.code()).toHaveText('Error 404');
  expect(await state.title()).toBe('Page not found · Giddy');
  await expect(state.link('Go to my home')).toHaveAttribute('href', '/');
  await expect(state.link('Get help')).toHaveAttribute('href', '/help');
});

test('says a party plan is private and names the signed-in email', async ({ page }) => {
  const state = new SystemStatePage(page);
  await state.open('/403');

  await expect(state.heading('This party plan is private')).toBeVisible();
  await expect(state.message()).toContainText('You’re signed in as amara.okafor@example.com');
  await expect(state.link('See my parties')).toHaveAttribute('href', '/parties');
  await expect(state.link('Switch account')).toBeVisible();
});

test('apologises for a server error, says plans are safe and shows the reference code', async ({
  page,
}) => {
  const state = new SystemStatePage(page);
  await state.open('/500?ref=GDY-5XR1&from=%2Fparties');

  await expect(state.heading('Giddy tripped over a balloon string')).toBeVisible();
  await expect(state.code()).toHaveText('Error 500 · Reference GDY-5XR1');
  await expect(state.message()).toContainText('Your plans are safe.');
  await expect(state.link('Go to my home')).toBeVisible();

  await state.tryAgain();
  await expect.poll(() => state.path()).toBe('/parties');
});

test('explains that there is no connection and offers to try again', async ({ page }) => {
  const state = new SystemStatePage(page);
  await state.open('/offline');

  await expect(state.heading('No internet right now')).toBeVisible();
  await expect(state.code()).toHaveText('You’re offline');
  await expect(state.button('Try again')).toBeVisible();
});

for (const path of ['/missing-page', '/403', '/500?ref=GDY-5XR1', '/offline']) {
  for (const width of [360, 1280]) {
    test(`${path} has one heading and no serious accessibility issues at ${width}px`, async ({
      page,
    }) => {
      const state = new SystemStatePage(page);
      await state.useWidth(width);
      await state.open(path);

      await expect(state.pageHeadings).toHaveCount(1);
      expect(await state.seriousAccessibilityViolations()).toEqual([]);
    });
  }
}

test('shows the offline page when a page cannot load without a connection', async ({ page }) => {
  const state = new SystemStatePage(page);
  await state.open('/');
  await state.goOffline();

  await state.followFooterLink('Terms & privacy');

  await expect(state.heading('No internet right now')).toBeVisible();
  await expect(state.footer).toBeVisible();
});
