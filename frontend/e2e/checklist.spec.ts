import { dinoParty, kofisDraft } from './fixtures/seed-data';
import { expect, test } from './fixtures/test';
import { ChecklistPage } from './pages/checklist.page';
import { ConfirmTaskDialog } from './pages/confirm-task.dialog';
import { LiveToasts } from './pages/live-toasts.page';
import { TaskDialog } from './pages/task.dialog';

test.describe('the checklist', () => {
  test('groups tasks by when they are due, with progress', async ({ page }) => {
    const checklist = new ChecklistPage(page);
    await checklist.openChecklist(dinoParty.id);

    await expect(checklist.sections.getByRole('link', { name: 'Checklist' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(checklist.subtitle).toHaveText(
      '3 of 10 done · 1 overdue · next: Book the entertainer',
    );
    await expect(checklist.progress).toHaveAttribute('aria-valuenow', '30');
    await expect
      .poll(() => checklist.groupHeadings())
      .toEqual(['Overdue · 1', 'This week · 2', 'Before the party · 4', 'Done · 3']);
    await expect(checklist.task('Book the entertainer')).toContainText(
      'Overdue · was due Tue 20 Oct',
    );
    await expect(checklist.task('Book the entertainer').locator('.task__due--late')).toBeVisible();
    await expect(checklist.task('Send an RSVP reminder')).toContainText('Giddy can do this');
    await expect(checklist.task('Order the food')).toContainText('Thu 12 Nov · Kemi');
    await expect(checklist.task('Book the venue')).toContainText('Done Fri 16 Oct');
  });

  test('ticking a task moves it to Done and updates progress', async ({ page }) => {
    const checklist = new ChecklistPage(page);
    await checklist.openChecklist(dinoParty.id);

    await checklist.checkbox('Order the cake').check();

    await expect(checklist.group('Done')).toContainText('Order the cake');
    await expect(checklist.progress).toHaveAttribute('aria-valuenow', '40');
    await checklist.checkbox('Order the cake').uncheck();
    await expect(checklist.group('This week')).toContainText('Order the cake');
  });

  test('shows a co-planner’s tick within five seconds', async ({ page, fakeApi }) => {
    const checklist = new ChecklistPage(page);
    const live = new LiveToasts(page);
    const listening = live.listening();
    await checklist.openChecklist(dinoParty.id);
    await listening;

    fakeApi.checklistStore.tick(dinoParty.id, 'Order the cake');
    fakeApi.guestStore.push({
      guestId: null,
      kind: 'task',
      tone: 'success',
      title: 'Kemi ticked off Order the cake',
      text: 'On the checklist for Zuri’s Dino Dig 7th.',
      action: null,
    });

    await expect(checklist.group('Done')).toContainText('Order the cake', { timeout: 5000 });
    await expect(live.toast('Kemi ticked off Order the cake')).toBeVisible();
  });

  test('celebrates when everything is done', async ({ page, fakeApi }) => {
    for (const t of fakeApi.checklistStore.tasks.get(dinoParty.id)!) {
      t.done = true;
      t.doneOn ??= '2026-10-25';
    }
    const checklist = new ChecklistPage(page);
    await checklist.openChecklist(dinoParty.id);

    await expect(checklist.celebration).toContainText('All 10 tasks done.');
    await expect(
      checklist.celebration.getByRole('link', { name: 'Open the run sheet' }),
    ).toHaveAttribute('href', `/parties/${dinoParty.id}/party-day`);
  });

  test('offers to make a checklist when there is none', async ({ page }) => {
    const checklist = new ChecklistPage(page);
    await checklist.openChecklist(kofisDraft.id);

    await expect(checklist.emptyState).toContainText('No tasks yet');
    await expect(checklist.emptyState).toContainText('working back from Wed 3 Feb');
    await checklist.emptyState.getByRole('button', { name: 'Add a task myself' }).click();
    const dialog = new TaskDialog(page);
    await expect(dialog.dialog).toBeVisible();
    await dialog.cancel.click();
    await checklist.emptyState.getByRole('button', { name: 'Make my checklist' }).click();

    await expect(checklist.subtitle).toHaveText('0 of 10 done · 0 overdue · next: Book the venue');
  });

  test('shows a retry when the checklist can’t load', async ({ page, fakeApi }) => {
    fakeApi.respond('GET', '/api/parties/:partyId/tasks', {
      status: 500,
      body: { status: 500, title: 'Something went wrong', referenceCode: 'GDY-C1' },
    });
    const checklist = new ChecklistPage(page);
    await checklist.openChecklist(dinoParty.id);

    await expect(checklist.emptyState).toContainText('We couldn’t load the checklist');
    await expect(checklist.emptyState).toContainText('GDY-C1');
  });

  test('lets viewers see the checklist but not change it', async ({ page, fakeApi }) => {
    fakeApi.partyStore.parties[0].role = 'viewer';
    const checklist = new ChecklistPage(page);
    await checklist.openChecklist(dinoParty.id);

    await expect(checklist.checkbox('Order the cake')).toBeDisabled();
    await expect(checklist.addTask).toHaveCount(0);
    await expect(checklist.menu('Order the cake')).toHaveCount(0);
  });
});

test.describe('adding and assigning tasks', () => {
  test('adds a task for a co-planner in date order', async ({ page }) => {
    const checklist = new ChecklistPage(page);
    await checklist.openChecklist(dinoParty.id);

    await checklist.addTask.click();
    const dialog = new TaskDialog(page);
    await expect(dialog.remind).toBeChecked();
    await dialog.title.fill('Buy number 7 candle and a lighter');
    await dialog.due.fill('2026-11-12');
    await expect(dialog.dialog).toContainText('Thu 12 Nov, 2 days before the party');
    await dialog.who.selectOption({ label: 'Kemi' });
    await dialog.save.click();

    await expect(dialog.dialog).toHaveCount(0);
    await expect
      .poll(() => checklist.titles('Before the party'))
      .toEqual([
        'Share the allergy list with the venue',
        'Confirm final numbers with the venue',
        'Order the food',
        'Buy number 7 candle and a lighter',
        'Pack the party-day kit',
      ]);
    await expect(checklist.task('Buy number 7 candle')).toContainText('Thu 12 Nov · Kemi');
  });

  test('says when the task has no title', async ({ page }) => {
    const checklist = new ChecklistPage(page);
    await checklist.openChecklist(dinoParty.id);

    await checklist.addTask.click();
    const dialog = new TaskDialog(page);
    await dialog.due.fill('2026-11-12');
    await dialog.save.click();

    await expect(dialog.title).toHaveAccessibleDescription(/Say what needs doing/);
    await expect(dialog.title).toHaveAttribute('aria-invalid', 'true');
  });

  test('the task menu offers Edit, Let Giddy do it, then Delete after a divider', async ({
    page,
  }) => {
    const checklist = new ChecklistPage(page);
    await checklist.openChecklist(dinoParty.id);

    await checklist.openMenu('Send an RSVP reminder');

    await expect(checklist.menuItems()).toHaveText(['Edit task', 'Let Giddy do it', 'Delete task']);
    await expect(checklist.menuDivider()).toHaveCount(1);
    await page.keyboard.press('Escape');
    await checklist.openMenu('Order the cake');
    await expect(checklist.menuItems()).toHaveText(['Edit task', 'Delete task']);
  });

  test('edits and deletes a task', async ({ page }) => {
    const checklist = new ChecklistPage(page);
    await checklist.openChecklist(dinoParty.id);

    await checklist.openMenu('Order the cake');
    await checklist.menuItem('Edit task').click();
    const dialog = new TaskDialog(page);
    await expect(dialog.title).toHaveValue('Order the cake');
    await dialog.title.fill('Order the dino cake from Sweet Rex');
    await dialog.save.click();
    await expect(checklist.task('Order the dino cake from Sweet Rex')).toBeVisible();

    await checklist.openMenu('Order the dino cake from Sweet Rex');
    await checklist.menuItem('Delete task').click();
    await new ConfirmTaskDialog(page).confirm.click();
    await expect(checklist.task('Order the dino cake')).toHaveCount(0);
    await expect(checklist.subtitle).toContainText('3 of 9 done');
  });
});

test.describe('tasks Giddy can do', () => {
  test('confirms before sending reminders, then ticks the task', async ({ page }) => {
    const checklist = new ChecklistPage(page);
    await checklist.openChecklist(dinoParty.id);

    await checklist.openMenu('Send an RSVP reminder');
    await checklist.menuItem('Let Giddy do it').click();
    const confirm = new ConfirmTaskDialog(page);
    await expect(confirm.dialog).toContainText('who hasn’t replied');
    await confirm.confirm.click();

    await expect(checklist.toast('Reminders sent to 3 families')).toBeVisible();
    await expect(checklist.group('Done')).toContainText('Send an RSVP reminder');
  });

  test('nothing is sent when the parent cancels', async ({ page }) => {
    const checklist = new ChecklistPage(page);
    await checklist.openChecklist(dinoParty.id);

    await checklist.openMenu('Share the allergy list with the venue');
    await checklist.menuItem('Let Giddy do it').click();
    const confirm = new ConfirmTaskDialog(page);
    await expect(confirm.dialog).toContainText('Dino Den Play Café');
    await confirm.cancel.click();

    await expect(checklist.group('Before the party')).toContainText('Share the allergy list');
  });
});

test.describe('checklist accessibility', () => {
  for (const width of [360, 1280]) {
    test(`has no serious violations at ${width}px, with the menu and dialog open`, async ({
      page,
    }) => {
      const checklist = new ChecklistPage(page);
      await checklist.useWidth(width);
      await checklist.openChecklist(dinoParty.id);
      await expect(checklist.progress).toBeVisible();

      expect(await checklist.seriousAccessibilityViolations()).toEqual([]);
      await checklist.openMenu('Order the cake');
      await expect(checklist.menuItems().first()).toBeVisible();
      expect(await checklist.seriousAccessibilityViolations()).toEqual([]);
      await checklist.menuItem('Edit task').click();
      await expect(new TaskDialog(page).dialog).toBeVisible();
      expect(await checklist.seriousAccessibilityViolations()).toEqual([]);
    });
  }
});
