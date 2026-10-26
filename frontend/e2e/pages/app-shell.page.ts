import { Locator, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export class AppShellPage {
  readonly skipLink: Locator;
  readonly banner: Locator;
  readonly primaryNavigation: Locator;
  readonly main: Locator;
  readonly footer: Locator;
  readonly pageHeadings: Locator;

  constructor(protected readonly page: Page) {
    this.skipLink = page.getByRole('link', { name: 'Skip to content' });
    this.banner = page.getByRole('banner');
    this.primaryNavigation = page.getByRole('navigation', { name: 'Primary navigation' });
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
