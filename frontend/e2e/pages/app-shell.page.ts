import { Locator, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export class AppShellPage {
  readonly skipLink: Locator;
  readonly banner: Locator;
  readonly primaryNavigation: Locator;
  readonly sidebar: Locator;
  readonly bottomBar: Locator;
  readonly search: Locator;
  readonly darkThemeToggle: Locator;
  readonly signIn: Locator;
  readonly main: Locator;
  readonly footer: Locator;
  readonly pageHeadings: Locator;

  constructor(protected readonly page: Page) {
    this.skipLink = page.getByRole('link', { name: 'Skip to content' });
    this.banner = page.getByRole('banner');
    this.primaryNavigation = page
      .getByRole('navigation', { name: /^Primary/ })
      .locator('visible=true');
    this.sidebar = page.getByRole('navigation', { name: 'Primary', exact: true });
    this.bottomBar = page.getByRole('navigation', { name: 'Primary, mobile' });
    this.signIn = page.getByRole('link', { name: 'Sign in' });
    this.darkThemeToggle = page.getByRole('button', { name: 'Dark theme' });
    this.search = page.getByRole('searchbox', { name: 'Search venues, fun and food' });
    this.main = page.getByRole('main');
    this.footer = page.getByRole('contentinfo');
    this.pageHeadings = page.getByRole('heading', { level: 1 });
  }

  /** Starts the browser clock at an instant, for example '2026-10-25T20:00:00Z', and lets it run. */
  async setNow(instant: string): Promise<void> {
    await this.page.clock.install({ time: new Date(instant) });
    await this.page.clock.resume();
  }

  async open(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async useWidth(width: number): Promise<void> {
    await this.page.setViewportSize({ width, height: 800 });
  }

  async preferColourScheme(colorScheme: 'dark' | 'light'): Promise<void> {
    await this.page.emulateMedia({ colorScheme });
  }

  async saveThemeBeforeLoad(theme: 'dark' | 'light'): Promise<void> {
    await this.page.addInitScript((value) => localStorage.setItem('giddy-theme', value), theme);
  }

  async toggleDarkTheme(): Promise<void> {
    await this.darkThemeToggle.click();
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  async goOffline(): Promise<void> {
    await this.page.context().setOffline(true);
  }

  async goOnline(): Promise<void> {
    await this.page.context().setOffline(false);
  }

  connectionBanner(): Locator {
    return this.page.locator('.offline-banner').getByRole('status');
  }

  async dismissConnectionBanner(): Promise<void> {
    await this.connectionBanner().getByRole('button', { name: 'Dismiss' }).click();
  }

  async preferReducedMotion(): Promise<void> {
    await this.page.emulateMedia({ reducedMotion: 'reduce' });
  }

  /** Sizes of every link and button in the navigation landmarks and main content. */
  async targetSizes(
    scope: 'navigation' | 'main',
  ): Promise<{ name: string; width: number; height: number }[]> {
    const container = scope === 'main' ? this.main : this.primaryNavigation;
    return container.locator('a:visible, button:visible').evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        return { name: element.textContent?.trim() ?? '', width: box.width, height: box.height };
      }),
    );
  }

  async followFooterLink(name: string): Promise<void> {
    await this.footer.getByRole('link', { name }).click();
  }

  async skipToContent(): Promise<void> {
    await this.skipLink.focus();
    await this.page.keyboard.press('Enter');
  }

  accountLink(parentName: string): Locator {
    return this.banner.getByRole('link', { name: `Account settings for ${parentName}` });
  }

  sidebarLink(name: string): Locator {
    return this.sidebar.getByRole('link', { name, exact: true });
  }

  sidebarGroup(name: string): Locator {
    return this.sidebar.getByText(name, { exact: true });
  }

  async bottomBarLabels(): Promise<string[]> {
    return (await this.bottomBar.getByRole('link').allInnerTexts()).map((text) => text.trim());
  }

  /** Whether the footer's text can be scrolled clear of the fixed bottom bar. */
  async footerClearsBottomBar(): Promise<boolean> {
    await this.footer.scrollIntoViewIfNeeded();
    await this.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const footerText = await this.footer.locator('span').first().boundingBox();
    const bar = await this.bottomBar.boundingBox();
    return !!footerText && !!bar && footerText.y + footerText.height <= bar.y;
  }

  scrollsSideways(): Promise<boolean> {
    return this.page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
  }

  theme(): Promise<string | null> {
    return this.page.locator('html').getAttribute('data-theme');
  }

  language(): Promise<string | null> {
    return this.page.locator('html').getAttribute('lang');
  }

  async seriousAccessibilityViolations(): Promise<string[]> {
    // Let transitions and entrance animations settle so axe measures what the parent actually sees.
    await this.page.waitForFunction(() =>
      document
        .getAnimations()
        .every(
          (animation) =>
            animation.playState !== 'running' ||
            animation.effect?.getComputedTiming().iterations === Infinity,
        ),
    );
    const results = await new AxeBuilder({ page: this.page }).analyze();
    return results.violations
      .filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))
      .map(
        (violation) =>
          `${violation.id}: ${violation.help} ${violation.nodes.map((n) => n.target.join(' ') + ' ' + n.failureSummary).join(' / ')}`,
      );
  }
}
