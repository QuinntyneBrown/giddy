import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** A party's guest list: replies, the allergy list, selection and reminders. */
export class GuestsPage extends AppShellPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly sections: Locator;
  readonly tally: Locator;
  readonly allergyList: Locator;
  readonly sendAllergyList: Locator;
  readonly table: Locator;
  readonly selectionBar: Locator;
  readonly sendReminder: Locator;
  readonly clearSelection: Locator;
  readonly toasts: Locator;
  readonly search: Locator;
  readonly addGuest: Locator;
  readonly importGuests: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Guests' });
    this.subtitle = page.locator('.page-header .subtitle');
    this.sections = page.getByRole('navigation', { name: 'Party sections' });
    this.tally = page.locator('giddy-tally');
    this.allergyList = page.getByRole('region', { name: 'Allergy list' });
    this.sendAllergyList = this.allergyList.getByRole('button', { name: /^Send to / });
    this.table = page.getByRole('table', { name: 'Guest list' });
    this.selectionBar = page.locator('giddy-toast').filter({ hasText: 'selected' });
    this.sendReminder = page.getByRole('button', { name: /^Send reminder/ });
    this.clearSelection = page.getByRole('button', { name: 'Clear selection' });
    this.toasts = page.locator('giddy-toast');
    this.search = page.getByRole('searchbox', { name: 'Search kids or parents' });
    this.addGuest = page.getByRole('button', { name: 'Add guest' });
    this.importGuests = page.getByRole('button', { name: 'Import', exact: true });
    this.emptyState = page.locator('[giddy-empty-state]');
  }

  async openGuests(partyId: string): Promise<void> {
    await this.open(`/parties/${partyId}/guests`);
  }

  chip(label: string): Locator {
    return this.page
      .getByRole('group', { name: 'Filter guests' })
      .getByRole('button', { name: new RegExp(`^${label} \\d+$`) });
  }

  rows(): Locator {
    return this.table.getByRole('row').filter({ has: this.page.getByRole('cell') });
  }

  async childNames(): Promise<string[]> {
    await this.rows().first().waitFor();
    return this.rows().locator('.guests__child strong').allInnerTexts();
  }

  rowAction(child: string, action: 'Message' | 'Remove'): Locator {
    return this.row(child).getByRole(action === 'Message' ? 'link' : 'button', {
      name: `${action === 'Message' ? 'Message the parent of' : 'Remove'} ${child}`,
    });
  }

  row(child: string): Locator {
    return this.table.getByRole('row').filter({ hasText: child });
  }

  async select(...children: string[]): Promise<void> {
    for (const child of children) {
      await this.page.getByRole('checkbox', { name: `Select ${child}` }).check();
    }
  }

  checkboxes(): Locator {
    return this.table.getByRole('checkbox');
  }

  toast(title: string | RegExp): Locator {
    return this.toasts.filter({ hasText: title });
  }
}
