import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

export class HomePage extends AppShellPage {
  readonly greeting: Locator;
  readonly subtitle: Locator;
  readonly loading: Locator;
  readonly nextParty: Locator;
  readonly countdown: Locator;
  readonly readiness: Locator;
  readonly nudges: Locator;
  readonly quickStart: Locator;
  readonly rsvps: Locator;
  readonly comingUpNext: Locator;
  readonly error: Locator;
  readonly firstPartyInvite: Locator;

  constructor(page: Page) {
    super(page);
    this.greeting = page.getByRole('heading', { level: 1 });
    this.subtitle = this.main.locator('.page-header .subtitle');
    this.loading = page.locator('[aria-busy="true"]');
    this.nextParty = page.getByRole('region').filter({ hasText: 'Next up' });
    this.countdown = this.nextParty.locator('.countdown');
    this.readiness = this.nextParty.getByRole('img', { name: /ready/ });
    this.nudges = page.getByRole('region', { name: 'Giddy’s nudges' });
    this.quickStart = page.getByRole('region', { name: 'Quick start' });
    this.rsvps = page.getByRole('region', { name: 'RSVPs' });
    this.comingUpNext = page.getByRole('region', { name: 'Coming up next' });
    this.error = page.getByRole('alert').filter({ hasText: 'We couldn’t load your home' });
    this.firstPartyInvite = page.getByRole('region', { name: 'Who’s the next birthday star?' });
  }

  partyName(name: string): Locator {
    return this.nextParty.getByRole('heading', { level: 2, name });
  }

  partyWhen(): Locator {
    return this.nextParty.locator('time');
  }

  link(name: string): Locator {
    return this.main.getByRole('link', { name, exact: true });
  }

  nudgeItems(): Locator {
    return this.nudges.getByRole('listitem');
  }

  nudgesWarning(): Locator {
    return this.nudges.getByRole('status');
  }

  runningSkeletonAnimations(): Promise<number> {
    return this.loading
      .locator('.skeleton')
      .first()
      .evaluate(
        (element) => element.getAnimations().filter((a) => a.playState === 'running').length,
      );
  }

  async tryAgain(): Promise<void> {
    await this.error.getByRole('button', { name: 'Try again' }).click();
  }

  async retryNudges(): Promise<void> {
    await this.nudgesWarning().getByRole('button', { name: 'Try again' }).click();
  }
}
