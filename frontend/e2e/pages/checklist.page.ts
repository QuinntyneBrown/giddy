import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** A party's checklist: progress, tasks grouped by when they're due, and their menus. */
export class ChecklistPage extends AppShellPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly sections: Locator;
  readonly progress: Locator;
  readonly addTask: Locator;
  readonly emptyState: Locator;
  readonly celebration: Locator;
  readonly toasts: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Checklist' });
    this.subtitle = page.locator('.page-header .subtitle');
    this.sections = page.getByRole('navigation', { name: 'Party sections' });
    this.progress = page.getByRole('progressbar', { name: /^Checklist \d+% done$/ });
    this.addTask = page.locator('.page-header').getByRole('button', { name: 'Add task' });
    this.emptyState = page.locator('[giddy-empty-state]');
    this.celebration = page.getByRole('region', { name: /^Everything’s ready/ });
    this.toasts = page.locator('giddy-toast');
  }

  async openChecklist(partyId: string): Promise<void> {
    await this.open(`/parties/${partyId}/checklist`);
  }

  /** The group headings in order, such as "Overdue · 1". */
  groupHeadings(): Promise<string[]> {
    return this.page.locator('main section[giddy-card] h2').allInnerTexts();
  }

  group(name: string): Locator {
    return this.page.getByRole('region', { name: new RegExp(`^${name} · \\d+$`) });
  }

  task(title: string): Locator {
    return this.page.locator('li[giddy-task]').filter({ hasText: title });
  }

  async titles(group: string): Promise<string[]> {
    return this.group(group)
      .locator('li[giddy-task] .task__text > span:first-child')
      .allInnerTexts();
  }

  checkbox(title: string): Locator {
    return this.task(title).getByRole('checkbox');
  }

  menu(title: string): Locator {
    return this.page.getByRole('button', { name: `More actions for ${title}` });
  }

  /**
   * Opens a task's menu. The trigger is centred first: on phones the bottom navigation can cover
   * it, and focusing a covered trigger scrolls the page while the menu is being placed.
   */
  async openMenu(title: string): Promise<void> {
    const trigger = this.menu(title);
    await trigger.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await trigger.click();
    await this.menuItems().first().waitFor();
  }

  menuItems(): Locator {
    return this.page.getByRole('menu').getByRole('menuitem');
  }

  menuItem(name: string): Locator {
    return this.page.getByRole('menu').getByRole('menuitem', { name });
  }

  menuDivider(): Locator {
    return this.page.getByRole('menu').getByRole('separator');
  }

  toast(heading: string): Locator {
    return this.toasts.filter({ hasText: heading });
  }
}
