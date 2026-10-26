import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('provides accessible application landmarks and responsive navigation', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeVisible();
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

  await page.setViewportSize({ width: 360, height: 800 });
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
});

test('uses the system dark theme when no preference is saved', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('uses a saved theme choice ahead of the system preference', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => localStorage.setItem('giddy-theme', 'light'));
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('shows a helpful not-found page for an unknown route', async ({ page }) => {
  await page.goto('/missing-page');

  await expect(page.getByRole('heading', { name: 'We could not find that page' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go home' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get help' })).toBeVisible();
});

test('declares Canadian English for GTA parents', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en-CA');
});

test('has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});
