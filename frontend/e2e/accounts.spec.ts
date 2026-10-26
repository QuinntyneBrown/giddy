import { amara, dinoParty } from './fixtures/seed-data';
import { demoPassword } from './fixtures/fake-accounts';
import { expect, test } from './fixtures/test';
import { AddGuestDialog } from './pages/add-guest.dialog';
import { AppShellPage } from './pages/app-shell.page';
import { GuestsPage } from './pages/guests.page';
import { PartyDayPage } from './pages/party-day.page';
import { PasswordPage } from './pages/password.page';
import { SessionExpiredDialog } from './pages/session-expired.dialog';
import { SettingsPage } from './pages/settings.page';
import { SignInPage } from './pages/sign-in.page';
import { SignOutDialog } from './pages/sign-out.dialog';
import { SignUpPage } from './pages/sign-up.page';
import { VerifyEmailPage } from './pages/verify-email.page';

test.describe('signing up', () => {
  test.beforeEach(({ fakeApi }) => {
    fakeApi.session = null;
  });

  test('creates an account and asks the parent to check their email', async ({ page, fakeApi }) => {
    const signUp = new SignUpPage(page);
    await signUp.openSignUp();

    await signUp.fill({
      firstName: 'Rania',
      email: 'rania@example.com',
      password: 'dino-dig-2026',
      postalCode: 'M4M 1H1',
    });
    await signUp.submit.click();

    const verify = new VerifyEmailPage(page);
    await expect(verify.heading).toHaveText('One quick thing: check your email');
    await expect(page.locator('main')).toContainText('rania@example.com');
    expect(fakeApi.accountStore.signUps.at(-1)!['marketing']).toBe(false);
  });

  test('says how to fix each field and focuses the summary', async ({ page }) => {
    const signUp = new SignUpPage(page);
    await signUp.openSignUp();

    await signUp.fill({ email: 'rania', password: 'short', postalCode: 'K1A 0B1' });
    await signUp.submit.click();

    await expect(signUp.errorSummary).toBeFocused();
    await expect(signUp.errorSummary).toContainText('Enter your first name');
    await expect(signUp.email).toHaveAccessibleDescription(
      /Enter an email address like name@example.com/,
    );
    await expect(signUp.password).toHaveAttribute('aria-invalid', 'true');
    await expect(signUp.postalCode).toHaveAccessibleDescription(/Enter a postal code in the GTA/);
  });

  test('refuses a breached password', async ({ page }) => {
    const signUp = new SignUpPage(page);
    await signUp.openSignUp();

    await signUp.fill({
      firstName: 'Rania',
      email: 'rania@example.com',
      password: 'password123!',
      postalCode: 'M4M 1H1',
    });
    await signUp.submit.click();

    await expect(signUp.password).toHaveAccessibleDescription(/hasn’t appeared in a data breach/);
  });

  test('points an existing account to sign in or reset', async ({ page }) => {
    const signUp = new SignUpPage(page);
    await signUp.openSignUp();

    await signUp.fill({
      firstName: 'Amara',
      email: amara.email,
      password: 'dino-dig-2026',
      postalCode: 'M4M 1H1',
    });
    await signUp.submit.click();

    await expect(signUp.problem).toContainText(
      `There’s already a Giddy account for ${amara.email}`,
    );
    await expect(signUp.problem.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in',
    );
    await expect(signUp.problem.getByRole('link', { name: 'Reset password' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  test('can’t be sent twice while it is submitting', async ({ page, fakeApi }) => {
    fakeApi.respond('POST', '/api/auth/sign-up', {
      status: 201,
      body: { email: 'rania@example.com' },
      delayMs: 1500,
    });
    const signUp = new SignUpPage(page);
    await signUp.openSignUp();

    await signUp.fill({
      firstName: 'Rania',
      email: 'rania@example.com',
      password: 'dino-dig-2026',
      postalCode: 'M4M 1H1',
    });
    await signUp.submit.click();

    await expect(signUp.submit).toBeDisabled();
    await expect(signUp.email).toHaveAttribute('readonly', '');
  });
});

test.describe('confirming the email', () => {
  test.beforeEach(({ fakeApi }) => {
    fakeApi.session = null;
  });

  test('a fresh link confirms the email and leads to family setup', async ({ page }) => {
    const verify = new VerifyEmailPage(page);
    await verify.openLink('good-token');

    await expect(verify.heading).toHaveText('You’re in, Rania!');
    await verify.setUpFamily.click();
    await expect(page).toHaveURL(/\/welcome$/);
  });

  test('an expired link offers a new one', async ({ page, fakeApi }) => {
    const verify = new VerifyEmailPage(page);
    await verify.openLink('old-token');

    await expect(verify.heading).toHaveText('This confirmation link has expired');
    await verify.sendNewLink.click();

    await expect(verify.status).toContainText('We sent a new link');
    expect(fakeApi.accountStore.resends).toBe(1);
  });

  test('resending too soon says when it can be used again', async ({ page, fakeApi }) => {
    fakeApi.accountStore.resendWaitSeconds = 40;
    const verify = new VerifyEmailPage(page);
    await verify.open('/verify-email?sent=rania%40example.com');

    await verify.resend.click();

    await expect(verify.status).toContainText('You can send another link in 40 seconds');
  });

  test('an unverified parent sees a banner until they confirm, and a bounce is called out', async ({
    page,
    fakeApi,
  }) => {
    fakeApi.session = { ...amara, emailVerified: false };
    const shell = new AppShellPage(page);
    await shell.open();

    await expect(shell.emailBanner()).toContainText('Confirm your email to send invitations');
    await shell.emailBanner().getByRole('button', { name: 'Resend link' }).click();
    await expect(shell.emailBanner()).toContainText('We sent a new link');

    fakeApi.session = { ...amara, emailVerified: false, emailBounced: true };
    await shell.open();
    await expect(shell.emailBanner()).toContainText(`We couldn’t deliver to ${amara.email}`);
    await expect(shell.emailBanner().getByRole('link', { name: 'Change email' })).toBeVisible();
  });
});

test.describe('signing in', () => {
  test.beforeEach(({ fakeApi }) => {
    fakeApi.session = null;
  });

  test('starts in the email field and allows password managers', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.openSignIn();

    await expect(signIn.email).toBeFocused();
    await expect(signIn.email).toHaveAttribute('autocomplete', 'email');
    await expect(signIn.password).toHaveAttribute('autocomplete', 'current-password');
  });

  test('a protected page sends the parent to sign in and back again', async ({ page, fakeApi }) => {
    const signIn = new SignInPage(page);
    await signIn.open('/parties');

    await expect(page).toHaveURL(/\/sign-in\?returnUrl=%2Fparties$/);
    await signIn.keepSignedIn.check();
    await signIn.signInWith(amara.email, demoPassword);

    await expect(page).toHaveURL(/\/parties$/);
    expect(fakeApi.accountStore.signIns.at(-1)!['keepSignedIn']).toBe(true);
  });

  test('a wrong password keeps the email and doesn’t say which was wrong', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.openSignIn();

    await signIn.signInWith(amara.email, 'not-my-password-1');

    await expect(signIn.problem).toContainText('That email and password don’t match');
    await expect(signIn.problem).toContainText('After 5 tries we pause sign-in for 15 minutes');
    await expect(signIn.email).toHaveValue(amara.email);
  });

  test('says when sign-in is paused', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.openSignIn();

    await signIn.signInWith('paused@example.com', 'whatever-1');

    await expect(signIn.problem).toContainText('Sign-in is paused for 15 minutes');
  });

  test('continues with Google into family setup', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.openSignIn();

    await expect(signIn.google).toHaveAttribute('href', '/api/auth/external/google?returnUrl=%2F');
    await signIn.google.click();

    await expect(page).toHaveURL(/\/welcome$/);
  });

  test('explains a provider sign-in that didn’t work', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.openSignIn('?error=provider');

    await expect(signIn.problem).toContainText('We couldn’t sign you in with that account');
  });
});

test.describe('resetting a password', () => {
  test.beforeEach(({ fakeApi }) => {
    fakeApi.session = null;
  });

  test('sends a link and says so whatever the email', async ({ page }) => {
    const password = new PasswordPage(page);
    await password.openForgot();

    await password.email.fill('anyone@example.com');
    await password.sendLink.click();

    await expect(password.heading).toHaveText('Check your inbox');
    await expect(page.locator('main')).toContainText(
      'If there’s an account for anyone@example.com',
    );
  });

  test('keeps the email when the email service is down', async ({ page, fakeApi }) => {
    fakeApi.accountStore.emailDown = true;
    const password = new PasswordPage(page);
    await password.openForgot();

    await password.email.fill(amara.email);
    await password.sendLink.click();

    await expect(password.problem).toContainText('We couldn’t send the email just now');
    await expect(password.email).toHaveValue(amara.email);
  });

  test('a new password signs the parent in', async ({ page }) => {
    const password = new PasswordPage(page);
    await password.openReset('reset-token');

    await expect(page.locator('main')).toContainText(`For ${amara.email}`);
    await password.newPassword.fill('short');
    await password.confirm.fill('different');
    await password.save.click();
    await expect(password.confirm).toHaveAccessibleDescription(/Passwords don’t match/);
    await password.newPassword.fill('volcano-lab-77');
    await password.confirm.fill('volcano-lab-77');
    await password.save.click();

    await expect(password.heading).toHaveText('Password updated');
    await password.backToPlanning.click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Amara');
  });

  test('an expired link offers a new one', async ({ page }) => {
    const password = new PasswordPage(page);
    await password.openReset('old-token');

    await expect(password.heading).toHaveText('This link has expired');
    await expect(page.getByRole('link', { name: 'Send a new link' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });
});

test.describe('sessions', () => {
  test('an expired session asks for the password and keeps what was being done', async ({
    page,
    fakeApi,
  }) => {
    const guests = new GuestsPage(page);
    await guests.openGuests(dinoParty.id);
    await guests.addGuest.click();
    const add = new AddGuestDialog(page);
    await add.child.fill('Rosa Diaz');
    await add.parent.fill('Elena Diaz');
    await add.email.fill('elena@example.com');

    fakeApi.sessionExpired = true;
    await add.save.click();

    const expired = new SessionExpiredDialog(page);
    await expect(expired.dialog).toContainText('Still there, Amara?');
    await expect(expired.email).toHaveValue(amara.email);
    await expired.password.fill('not-my-password-1');
    await expired.signBackIn.click();
    await expect(expired.dialog).toContainText('That password isn’t right');
    await expired.password.fill(demoPassword);
    await expired.signBackIn.click();

    await expect(expired.dialog).toHaveCount(0);
    await expect(guests.toast('Rosa Diaz added')).toBeVisible();
  });

  test('signing out ends the session and removes saved run sheets', async ({ page }) => {
    const day = new PartyDayPage(page);
    await day.openPartyDay(dinoParty.id);
    await expect(day.step('Guests arrive')).toBeVisible();
    expect(await day.savedOnDevice()).toBeGreaterThan(0);
    const settings = new SettingsPage(page);
    await settings.sidebarLink('Settings').click();

    await settings.signOut.click();
    await new SignOutDialog(page).signOut.click();

    await expect(page).toHaveURL(/\/sign-in/);
    expect(await settings.savedOnDevice()).toBe(0);
  });
});

test.describe('account pages accessibility', () => {
  for (const width of [360, 1280]) {
    test(`sign-up and sign-in have no serious violations at ${width}px`, async ({
      page,
      fakeApi,
    }) => {
      fakeApi.session = null;
      const signUp = new SignUpPage(page);
      await signUp.useWidth(width);
      await signUp.openSignUp();
      await signUp.submit.click();
      await expect(signUp.errorSummary).toBeVisible();
      expect(await signUp.seriousAccessibilityViolations()).toEqual([]);

      const signIn = new SignInPage(page);
      await signIn.openSignIn();
      await expect(signIn.heading).toBeVisible();
      expect(await signIn.seriousAccessibilityViolations()).toEqual([]);
    });
  }
});
