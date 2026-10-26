import { Locator, Page } from '@playwright/test';

/** The in-app ask before the browser's notification prompt, and the browser's answer. */
export class PushPrompt {
  readonly ask: Locator;
  readonly turnOn: Locator;
  readonly notNow: Locator;
  readonly turnedOn: Locator;
  readonly blocked: Locator;
  readonly showMeHow: Locator;

  constructor(private readonly page: Page) {
    this.ask = page.getByRole('status').filter({ hasText: 'Get a buzz when friends RSVP?' });
    this.turnOn = this.ask.getByRole('button', { name: 'Turn on' });
    this.notNow = this.ask.getByRole('button', { name: 'Not now' });
    this.turnedOn = page.getByRole('status').filter({ hasText: 'Notifications on' });
    this.blocked = page
      .getByRole('status')
      .filter({ hasText: 'Notifications are blocked in your browser' });
    this.showMeHow = this.blocked.getByRole('link', { name: 'Show me how' });
  }

  /**
   * Stands in for the browser's notification permission: undecided until asked, then the
   * given answer. Call before the page opens.
   */
  async browserWillAnswer(answer: 'granted' | 'denied'): Promise<void> {
    await this.page.addInitScript((reply) => {
      const state = { permission: 'default', asks: 0 };
      class FakeNotification {
        static get permission() {
          return state.permission;
        }
        static async requestPermission() {
          state.asks++;
          state.permission = reply;
          return reply;
        }
      }
      Object.assign(window, {
        Notification: FakeNotification,
        giddyPermissionAsks: () => state.asks,
      });
    }, answer);
  }

  /** How many times the browser's own permission prompt was shown. */
  browserAsks(): Promise<number> {
    return this.page.evaluate(() =>
      (window as unknown as { giddyPermissionAsks: () => number }).giddyPermissionAsks(),
    );
  }
}
