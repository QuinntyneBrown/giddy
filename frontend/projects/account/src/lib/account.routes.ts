import { Routes } from '@angular/router';

/** Pages for visitors: they are outside the sign-in guard. */
export const accountRoutes: Routes = [
  {
    path: 'sign-up',
    loadComponent: () => import('./sign-up-page/sign-up-page').then((m) => m.SignUpPage),
    title: 'Create your account · Giddy',
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./verify-email-page/verify-email-page').then((m) => m.VerifyEmailPage),
    title: 'Confirm your email · Giddy',
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./sign-in-page/sign-in-page').then((m) => m.SignInPage),
    title: 'Sign in · Giddy',
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password-page/forgot-password-page').then((m) => m.ForgotPasswordPage),
    title: 'Forgot your password · Giddy',
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./reset-password-page/reset-password-page').then((m) => m.ResetPasswordPage),
    title: 'Choose a new password · Giddy',
  },
];
