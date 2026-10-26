import { expect, test } from './fixtures/test';
import { AppShellPage } from './pages/app-shell.page';

test('shows the signed-in parent in the top bar', async ({ page }) => {
  const shell = new AppShellPage(page);
  await shell.open();

  await expect(shell.accountLink('Amara Okafor')).toHaveText('AO');
});

test('shows only the public top bar with Sign in when nobody is signed in', async ({
  page,
  fakeApi,
}) => {
  fakeApi.session = null;
  const shell = new AppShellPage(page);
  await shell.useWidth(1280);
  await shell.open();

  await expect(shell.signIn).toBeVisible();
  await expect(shell.sidebar).toHaveCount(0);
  await expect(shell.bottomBar).toHaveCount(0);
});
