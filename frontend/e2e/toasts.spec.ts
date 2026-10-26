import { dinoParty } from './fixtures/seed-data';
import { expect, test } from './fixtures/test';
import { BudgetPage } from './pages/budget.page';
import { ChecklistPage } from './pages/checklist.page';
import { CostDialog } from './pages/cost.dialog';
import { LiveToasts } from './pages/live-toasts.page';

const now = '2026-10-25T16:00:00Z';

test.describe('toasts', () => {
  test('a success toast fades after 8 seconds, paused while the pointer is on it', async ({
    page,
  }) => {
    const budget = new BudgetPage(page);
    await budget.setNow(now);
    await budget.openBudget(dinoParty.id);
    await budget.addCost.click();
    const dialog = new CostDialog(page);
    await dialog.fill({ description: 'Dino balloons', amount: '22' });
    await dialog.save.click();
    const toast = budget.toast('Dino balloons added');
    await expect(toast).toBeVisible();

    await page.clock.fastForward(6000);
    await expect(toast).toBeVisible();
    await toast.hover();
    await page.clock.fastForward(10_000);
    await expect(toast).toBeVisible();
    await page.mouse.move(0, 0);
    await page.clock.fastForward(2500);
    await expect(toast).toHaveCount(0);
  });

  test('a warning stays 12 seconds', async ({ page, fakeApi }) => {
    const live = new LiveToasts(page);
    const budget = new BudgetPage(page);
    await budget.setNow(now);
    const listening = live.listening();
    await budget.openBudget(dinoParty.id);
    await listening;
    fakeApi.guestStore.push({
      guestId: null,
      kind: 'allergy',
      tone: 'warning',
      title: 'New allergy: sesame',
      text: 'Rania says Sofia has a sesame allergy.',
      action: null,
    });
    await page.clock.fastForward(3000);
    const toast = live.toast('New allergy: sesame');
    await expect(toast).toBeVisible();

    await page.clock.fastForward(9000);
    await expect(toast).toBeVisible();
    await page.clock.fastForward(4000);
    await expect(toast).toHaveCount(0);
  });

  test('a danger toast is an alert that stays until dismissed', async ({ page, fakeApi }) => {
    fakeApi.respond('PUT', '/api/parties/:partyId/tasks/:taskId/done', { status: 500 });
    const checklist = new ChecklistPage(page);
    await checklist.setNow(now);
    await checklist.openChecklist(dinoParty.id);

    await checklist.checkbox('Order the cake').check();
    const toast = checklist.toast('That didn’t save');
    await expect(toast).toHaveAttribute('role', 'alert');
    await page.clock.fastForward(60_000);
    await expect(toast).toBeVisible();
    await toast.getByRole('button', { name: 'Dismiss' }).click();
    await expect(toast).toHaveCount(0);
  });

  test('no more than three show at once', async ({ page, fakeApi }) => {
    const live = new LiveToasts(page);
    const budget = new BudgetPage(page);
    await budget.setNow(now);
    const listening = live.listening();
    await budget.openBudget(dinoParty.id);
    await listening;

    for (const child of ['Maya', 'Leo', 'Sofia', 'Noah'])
      fakeApi.guestStore.push({
        guestId: null,
        kind: 'replied',
        tone: 'success',
        title: `${child} is coming!`,
        text: 'A family replied.',
        action: null,
      });
    await page.clock.fastForward(3000);

    await expect(live.region.locator('giddy-toast')).toHaveCount(3);
    await expect(live.toast('Maya is coming!')).toHaveCount(0);
    await expect(live.toast('Noah is coming!')).toBeVisible();
  });
});
