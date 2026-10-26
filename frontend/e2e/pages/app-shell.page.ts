import { Locator, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export class AppShellPage {
  readonly skipLink: Locator;
  readonly banner: Locator;
  readonly primaryNavigation: Locator;
  readonly sidebar: Locator;
  readonly bottomBar: Locator;
  readonly search: Locator;
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
    this.search = page.getByRole('searchbox', { name: 'Search venues, fun and food' });
    this.main = page.getByRole('main');
    this.footer = page.getByRole('contentinfo');
    this.pageHeadings = page.getByRole('heading', { level: 1 });
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

  async skipToContent(): Promise<void> {
    await this.skipLink.focus();
    await this.page.keyboard.press('Enter');
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
    const results = await new AxeBuilder({ page: this.page }).analyze();
    return results.violations
      .filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))
      .map((violation) => `${violation.id}: ${violation.help}`);
  }
}
