import { expect, test } from '@playwright/test';

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
