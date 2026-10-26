import { expect, test } from './fixtures/test';
import { AppShellPage } from './pages/app-shell.page';
import { CookieConsent } from './pages/cookie-consent.page';

const year = 365 * 24 * 60 * 60 * 1000;

test.use({ cookieChoice: null });

test('a first visit offers three choices of equal weight', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.open('/sign-in');
  const consent = new CookieConsent(page);

  await expect(consent.bar).toBeVisible();
  const classes = await Promise.all(
    [consent.essentialOnly, consent.allowAll, consent.choose].map((b) => b.getAttribute('class')),
  );
  expect(new Set(classes).size).toBe(1);
  expect(await shell.seriousAccessibilityViolations()).toEqual([]);
});

test('a choice is confirmed with a toast and remembered for 12 months', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-25T12:00:00') });
  const shell = new AppShellPage(page);
  await shell.open('/sign-in');
  const consent = new CookieConsent(page);

  await consent.essentialOnly.click();

  await expect(consent.bar).toHaveCount(0);
  await expect(consent.saved).toContainText(
    'Essential only. Change it any time in Terms & privacy.',
  );
  await shell.open('/sign-in');
  await expect(shell.main).toBeVisible();
  await expect(consent.bar).toHaveCount(0);

  await page.clock.setSystemTime(new Date(Date.parse('2026-10-25T12:00:00') + year + 1000));
  await shell.open('/sign-in');
  await expect(consent.bar).toBeVisible();
});

test('the choice can be changed on Terms & privacy', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.open('/sign-in');
  const consent = new CookieConsent(page);

  await consent.choose.click();
  await expect(consent.legalHeading).toBeVisible();
  await consent.option('Allow all').check();
  await consent.saveChoice.click();

  await expect(consent.saved).toContainText('Allow all');
  await expect(consent.bar).toHaveCount(0);
  await shell.open('/legal');
  await expect(consent.option('Allow all')).toBeChecked();
  expect(await shell.seriousAccessibilityViolations()).toEqual([]);
});
