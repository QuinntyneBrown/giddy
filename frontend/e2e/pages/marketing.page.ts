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
  readonly sectionNavigation: Locator;
  readonly hero: Locator;
  readonly watch: Locator;
  readonly video: Locator;
  readonly transcriptToggle: Locator;
  readonly transcript: Locator;
  readonly videoUnavailable: Locator;
  readonly posterStill: Locator;
  readonly footer: Locator;
  private readonly apiRequests: string[] = [];

  constructor(private readonly page: Page) {
    this.body = page.locator('body');
    this.main = page.locator('main#main');
    this.heroHeading = page.getByRole('heading', { level: 1 });
    this.header = page.getByRole('banner');
    this.logoLink = this.header.getByRole('link', { name: 'Giddy, back to the top' });
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
