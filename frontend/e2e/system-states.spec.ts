import { expect, test } from './fixtures/test';
import { SystemStatePage } from './pages/system-state.page';

test('shows a helpful not-found page for an unknown route', async ({ page }) => {
  const state = new SystemStatePage(page);
  await state.open('/missing-page');

  await expect(state.heading('We could not find that page')).toBeVisible();
  expect(await state.title()).toBe('Page not found · Giddy');
  await expect(state.link('Go home')).toBeVisible();
  await expect(state.link('Get help')).toBeVisible();
});

test('shows a plain-language no-access page', async ({ page }) => {
  const state = new SystemStatePage(page);
  await state.open('/403');

  await expect(state.heading('You do not have access to this page')).toBeVisible();
  await expect(state.link('Go home')).toBeVisible();
});

test('shows a recoverable server-error page', async ({ page }) => {
  const state = new SystemStatePage(page);
  await state.open('/500');

  await expect(state.heading('Something went wrong')).toBeVisible();
  await expect(state.link('Go home')).toBeVisible();
});

test('shows an offline page when the connection is unavailable', async ({ page }) => {
  const state = new SystemStatePage(page);
  await state.open('/offline');

  await expect(state.heading('You are offline')).toBeVisible();
  await expect(state.link('Go home')).toBeVisible();
});
