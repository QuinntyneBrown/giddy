import { Locator, Page } from '@playwright/test';

/** Adding or changing a checklist task. */
export class TaskDialog {
  readonly dialog: Locator;
  readonly title: Locator;
  readonly due: Locator;
  readonly who: Locator;
  readonly remind: Locator;
  readonly save: Locator;
  readonly cancel: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: /^(Add a task|Change this task)$/ });
    this.title = this.dialog.getByLabel('Task', { exact: true });
    this.due = this.dialog.getByLabel('Due');
    this.who = this.dialog.getByLabel('Who');
    this.remind = this.dialog.getByRole('checkbox', { name: 'Remind me the day before' });
    this.save = this.dialog.getByRole('button', { name: /^(Add task|Save changes)$/ });
    this.cancel = this.dialog.getByRole('button', { name: 'Cancel' });
  }
}
