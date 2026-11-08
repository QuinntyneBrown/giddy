import { Locator, Page, Request } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** The marketing site runs as its own application beside the app (L2-095). */
export const MARKETING_ORIGIN = 'http://127.0.0.1:4300';
/** The app the site links into, from the site's development environment. */
export const APP_ORIGIN = 'http://127.0.0.1:4200';

export class MarketingPage {
  readonly body: Locator;
  readonly main: Locator;
  readonly heroHeading: Locator;
  readonly header: Locator;
  readonly logoLink: Locator;
  readonly logoWordmark: Locator;
  readonly sectionNavigation: Locator;
  readonly hero: Locator;
  readonly watch: Locator;
  readonly video: Locator;
  readonly transcriptToggle: Locator;
  readonly transcript: Locator;
  readonly videoUnavailable: Locator;
  readonly posterStill: Locator;
  readonly footer: Locator;
  readonly revealBlocks: Locator;
  private readonly apiRequests: string[] = [];

  constructor(private readonly page: Page) {
    this.body = page.locator('body');
    this.main = page.locator('main#main');
    this.heroHeading = page.getByRole('heading', { level: 1 });
    this.header = page.getByRole('banner');
    this.logoLink = this.header.getByRole('link', { name: 'Giddy, back to the top' });
    this.logoWordmark = this.logoLink.getByRole('img', { name: 'Giddy', exact: true });
    this.sectionNavigation = page.getByRole('navigation', { name: 'Page sections' });
    this.hero = page.getByRole('region', { name: 'Parties they’ll flip for.' });
    this.watch = page.getByRole('region', { name: 'Giddy in twenty seconds' });
    this.video = this.watch.getByLabel('Meet Giddy, a twenty-second tour');
    this.transcriptToggle = this.watch.getByText('Read the transcript', { exact: true }).first();
    this.transcript = this.watch.locator('details');
    this.videoUnavailable = this.watch
      .getByRole('status')
      .filter({ hasText: 'This browser can’t play the video.' });
    this.posterStill = this.watch.getByRole('img', { name: /Meet Giddy/ });
    this.footer = page.getByRole('contentinfo');
    this.revealBlocks = page.locator('[data-reveal]');
    page.on('request', (request: Request) => {
      if (new URL(request.url()).pathname.startsWith('/api/')) this.apiRequests.push(request.url());
    });
  }

  async open(path = '/'): Promise<void> {
    await this.page.goto(new URL(path, MARKETING_ORIGIN).href);
    await this.heroHeading.waitFor();
  }

  async useWidth(width: number): Promise<void> {
    await this.page.setViewportSize({ width, height: 800 });
  }

  /** A link in the header by its name, such as "Sign in". */
  headerLink(name: string): Locator {
    return this.header.getByRole('link', { name, exact: true });
  }

  /** The names and addresses of the section links, in order. */
  async sectionLinks(): Promise<{ name: string; href: string | null }[]> {
    const links = await this.sectionNavigation.getByRole('link').all();
    return Promise.all(
      links.map(async (link) => ({
        name: (await link.textContent())?.trim() ?? '',
        href: await link.getAttribute('href'),
      })),
    );
  }

  heroLink(name: string): Locator {
    return this.hero.getByRole('link', { name, exact: true });
  }

  heroText(text: string): Locator {
    return this.hero.getByText(text, { exact: true });
  }

  path(): string {
    return new URL(this.page.url()).pathname;
  }

  async preferReducedMotion(): Promise<void> {
    await this.page.emulateMedia({ reducedMotion: 'reduce' });
  }

  async preferColourScheme(colorScheme: 'dark' | 'light'): Promise<void> {
    await this.page.emulateMedia({ colorScheme });
  }

  /** Whether the page is wider than the viewport, so it would scroll sideways. */
  async scrollsHorizontally(): Promise<boolean> {
    return this.page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
  }

  /** The opacity of every reveal block as the page first renders, before any scrolling. */
  async revealOpacities(): Promise<number[]> {
    return this.revealBlocks.evaluateAll((blocks) =>
      blocks.map((block) => Number(getComputedStyle(block).opacity)),
    );
  }

  /**
   * Presses Tab through the whole page and returns every link and disclosure that took focus,
   * with whether its box sat inside the viewport's width, and every visible one that never did.
   */
  async tabThroughPage(): Promise<{
    reached: { name: string; fits: boolean }[];
    missed: string[];
  }> {
    const reached = new Map<string, boolean>();
    for (let i = 0; i < 80; i++) {
      await this.page.keyboard.press('Tab');
      const focused = await this.page.evaluate(() => {
        const el = document.activeElement;
        if (!el || !el.matches('a, summary, button')) return null;
        const box = el.getBoundingClientRect();
        return {
          name: (el.getAttribute('aria-label') ?? el.textContent ?? '').replace(/\s+/g, ' ').trim(),
          href: el.getAttribute('href') ?? el.tagName,
          fits: box.left >= 0 && box.right <= document.documentElement.clientWidth + 0.5,
        };
      });
      if (focused) reached.set(`${focused.name}|${focused.href}`, focused.fits);
    }
    const visible = await this.page
      .locator('a:visible, summary:visible')
      .evaluateAll((els) =>
        els.map(
          (el) =>
            `${(el.getAttribute('aria-label') ?? el.textContent ?? '').replace(/\s+/g, ' ').trim()}|${el.getAttribute('href') ?? el.tagName}`,
        ),
      );
    return {
      reached: [...reached].map(([key, fits]) => ({ name: key, fits })),
      missed: visible.filter((key) => !reached.has(key)),
    };
  }

  /** Plays the pitch video muted, as a visitor pressing play would, and waits for it to run. */
  async playVideo(): Promise<void> {
    await this.video.evaluate(async (video: HTMLVideoElement) => {
      video.muted = true;
      await video.play();
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
  }

  /** A content section, by its id, such as `how` or `themes`. */
  section(id: string): Locator {
    return this.page.locator(`section#${id}`);
  }

  async sectionHeading(id: string): Promise<string> {
    return ((await this.section(id).getByRole('heading', { level: 2 }).textContent()) ?? '').trim();
  }

  /** The level-three headings inside a section, in order. */
  async itemHeadings(id: string): Promise<string[]> {
    return (await this.section(id).getByRole('heading', { level: 3 }).allTextContents()).map((t) =>
      t.trim(),
    );
  }

  /** The list items inside a section, in order. */
  async listItems(id: string): Promise<string[]> {
    return (await this.section(id).getByRole('listitem').allTextContents()).map((t) =>
      t.replace(/\s+/g, ' ').trim(),
    );
  }

  sectionLink(id: string, name: string): Locator {
    return this.section(id).getByRole('link', { name, exact: true });
  }

  footerLink(name: string): Locator {
    return this.footer.getByRole('link', { name, exact: true });
  }

  /** Makes the pitch video fail to load, as a browser that cannot play it would. */
  async breakTheVideo(): Promise<void> {
    await this.page.route('**/meet-giddy.mp4', (route) => route.abort());
  }

  /** The video's captions tracks: kind, language, label, whether it is default and its mode. */
  async captionTracks(): Promise<
    { kind: string; srclang: string; label: string; isDefault: boolean; mode: string }[]
  > {
    return this.video.evaluate((video: HTMLVideoElement) =>
      Array.from(video.querySelectorAll('track')).map((track, i) => ({
        kind: track.kind,
        srclang: track.srclang,
        label: track.label,
        isDefault: track.default,
        mode: video.textTracks[i]?.mode ?? '',
      })),
    );
  }

  /** The length of the pitch video in seconds, once the browser has read its metadata. */
  async videoDuration(): Promise<number> {
    return this.video.evaluate(
      (video: HTMLVideoElement) =>
        new Promise<number>((resolve, reject) => {
          if (video.readyState >= 1) return resolve(video.duration);
          video.addEventListener('loadedmetadata', () => resolve(video.duration), { once: true });
          video.addEventListener('error', () => reject(new Error('video failed')), { once: true });
          video.load();
        }),
    );
  }

  async isPaused(): Promise<boolean> {
    return this.video.evaluate((video: HTMLVideoElement) => video.paused);
  }

  async openTranscript(): Promise<void> {
    await this.transcriptToggle.click();
  }

  /** Serious and critical axe violations, in one section or on the whole page. */
  async accessibilityViolations(within?: string): Promise<string[]> {
    await this.page.waitForFunction(() =>
      document
        .getAnimations()
        .every(
          (animation) =>
            animation.playState !== 'running' ||
            animation.effect?.getComputedTiming().iterations === Infinity,
        ),
    );
    let builder = new AxeBuilder({ page: this.page });
    if (within) builder = builder.include(within);
    const results = await builder.analyze();
    return results.violations
      .filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))
      .map(
        (violation) =>
          `${violation.id}: ${violation.help} ${violation.nodes.map((n) => n.target.join(' ')).join(' / ')}`,
      );
  }

  /** Every request the site made to the Giddy API; the site must make none. */
  requestsToApi(): string[] {
    return [...this.apiRequests];
  }
}
