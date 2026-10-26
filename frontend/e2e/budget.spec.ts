import { dinoParty, kofisDraft } from './fixtures/seed-data';
import { expect, test } from './fixtures/test';
import { BudgetPage } from './pages/budget.page';
import { CostDialog } from './pages/cost.dialog';
import { SwapDialog } from './pages/swap.dialog';

test.describe('tracking the budget', () => {
  test('shows the totals, spend by category and every item with its status', async ({ page }) => {
    const budget = new BudgetPage(page);
    await budget.openBudget(dinoParty.id);

    await expect(budget.sections.getByRole('link', { name: 'Budget' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(budget.subtitle).toHaveText('$778 planned of $800 · $100 paid');
    await expect(budget.status).toHaveText('$22 left');
    await expect(budget.stat('Budget')).toContainText('$800');
    await expect(budget.stat('Planned')).toContainText('$778');
    await expect(budget.stat('Paid so far')).toContainText('$100');
    await expect(budget.stat('Per kid')).toContainText('$49');
    await expect(budget.meter).toHaveAccessibleName('$778 planned of $800 budget');
    await expect(budget.legend.getByRole('listitem')).toHaveText([
      'Venue $340',
      'Entertainer $195',
      'Cake $85',
      'Food $110',
      'Loot bags $48',
    ]);
    await expect(budget.row('Dino Den Play Café')).toContainText('Deposit paid');
    await expect(budget.row('Dino Den Play Café')).toContainText('$340');
    await expect(budget.row('Professor Fizz’s Volcano Lab')).toContainText('Estimate');
    await expect(budget.totals).toContainText('$778');
    await expect(budget.totals).toContainText('$100');
    await expect(budget.taxNote).toHaveCount(1);
  });

  test('shows a quote as Quoted without the parent editing anything', async ({ page, fakeApi }) => {
    const fizz = fakeApi.partyStore.bookings.find((b) => b.category === 'Entertainer')!;
    Object.assign(fizz, { status: 'quoted', price: 180 });
    const budget = new BudgetPage(page);
    await budget.openBudget(dinoParty.id);

    await expect(budget.row('Professor Fizz’s Volcano Lab')).toContainText('Quoted');
    await expect(budget.row('Professor Fizz’s Volcano Lab')).toContainText('$180');
    await expect(budget.subtitle).toHaveText('$763 planned of $800 · $100 paid');
  });

  test('offers Giddy’s estimates or adding a cost when there are none', async ({ page }) => {
    const budget = new BudgetPage(page);
    await budget.openBudget(kofisDraft.id);

    await expect(budget.emptyState).toContainText('No costs yet');
    await budget.emptyState.getByRole('button', { name: 'Add a cost myself' }).click();
    const dialog = new CostDialog(page);
    await expect(dialog.dialog).toBeVisible();
    await dialog.cancel.click();
    await budget.emptyState.getByRole('button', { name: 'Fill in from the plan' }).click();

    await expect(budget.rows()).toHaveCount(5);
    await expect(budget.row('Food (estimate)')).toContainText('$84');
    await expect(budget.subtitle).toHaveText('$712 planned of $500 · $0 paid');
  });

  test('shows a retry when the budget can’t load', async ({ page, fakeApi }) => {
    fakeApi.respond('GET', '/api/parties/:partyId/budget', {
      status: 500,
      body: { status: 500, title: 'Something went wrong', referenceCode: 'GDY-B1' },
    });
    const budget = new BudgetPage(page);
    await budget.openBudget(dinoParty.id);

    await expect(budget.emptyState).toContainText('We couldn’t load the budget');
    await expect(budget.emptyState).toContainText('GDY-B1');
  });

  test('lets viewers see the budget but not change it', async ({ page, fakeApi }) => {
    fakeApi.partyStore.parties[0].role = 'viewer';
    const budget = new BudgetPage(page);
    await budget.openBudget(dinoParty.id);

    await expect(budget.subtitle).toHaveText('$778 planned of $800 · $100 paid');
    await expect(budget.addCost).toHaveCount(0);
  });
});

test.describe('adding and changing costs', () => {
  test('previews what is left, then adds the cost to the table and totals', async ({ page }) => {
    const budget = new BudgetPage(page);
    await budget.openBudget(dinoParty.id);

    await budget.addCost.click();
    const dialog = new CostDialog(page);
    await dialog.fill({
      description: 'Dino balloons and banner',
      category: 'Decorations',
      amount: '22',
      paid: true,
    });

    await expect(dialog.preview).toHaveText('After this you’ll have $0 left of your $800 budget.');
    await dialog.save.click();
    await expect(dialog.dialog).toHaveCount(0);
    await expect(budget.row('Dino balloons and banner')).toContainText('Paid');
    await expect(budget.subtitle).toHaveText('$800 planned of $800 · $122 paid');
    await expect(budget.legend.getByRole('listitem').last()).toHaveText('Decorations $22');
  });

  test('says how to write an amount', async ({ page }) => {
    const budget = new BudgetPage(page);
    await budget.openBudget(dinoParty.id);

    await budget.addCost.click();
    const dialog = new CostDialog(page);
    await dialog.fill({ description: 'Balloons', amount: '35.555' });
    await dialog.save.click();

    await expect(dialog.amount).toHaveAccessibleDescription(/Enter an amount like 35 or 35.50/);
    await expect(dialog.amount).toHaveAttribute('aria-invalid', 'true');
    await dialog.fill({ amount: 'twenty' });
    await dialog.save.click();
    await expect(dialog.amount).toHaveAccessibleDescription(/Enter an amount like 35 or 35.50/);
  });

  test('edits and removes a cost, updating the totals straight away', async ({ page, fakeApi }) => {
    fakeApi.budgetStore.expenses.set(dinoParty.id, [
      {
        id: 'cost-a',
        description: 'Dino balloons and banner',
        category: 'Decorations',
        amount: 22,
        paid: true,
      },
    ]);
    const budget = new BudgetPage(page);
    await budget.openBudget(dinoParty.id);

    await budget.edit('Dino balloons and banner').click();
    const dialog = new CostDialog(page);
    await expect(dialog.amount).toHaveValue('22');
    await dialog.fill({ amount: '15', paid: false });
    await expect(dialog.preview).toHaveText('After this you’ll have $7 left of your $800 budget.');
    await dialog.save.click();

    await expect(budget.subtitle).toHaveText('$793 planned of $800 · $100 paid');
    await expect(budget.row('Dino balloons and banner')).toContainText('Estimate');
    await budget.edit('Dino balloons and banner').click();
    await dialog.remove.click();
    await expect(budget.row('Dino balloons and banner')).toHaveCount(0);
    await expect(budget.subtitle).toHaveText('$778 planned of $800 · $100 paid');
  });

  test('leaves Giddy’s own items to change through their vendors', async ({ page }) => {
    const budget = new BudgetPage(page);
    await budget.openBudget(dinoParty.id);

    await expect(budget.row('Dino Den Play Café').getByRole('button')).toHaveCount(0);
  });
});

test.describe('getting back within budget', () => {
  test('warns with the amount over and swaps to a cheaper vendor', async ({ page, fakeApi }) => {
    fakeApi.budgetStore.expenses.set(dinoParty.id, [
      {
        id: 'cost-a',
        description: 'Balloon arch',
        category: 'Decorations',
        amount: 40,
        paid: false,
      },
    ]);
    const budget = new BudgetPage(page);
    await budget.openBudget(dinoParty.id);

    await expect(budget.overBudget).toContainText('You’re $18 over budget');
    await expect(budget.overBudget).toContainText(
      'Swap Professor Fizz’s Volcano Lab ($195) for Rexy the Dino Visit ($150) to save $45.',
    );
    await expect(budget.status).toHaveText('$18 over');
    await expect(budget.meter).toHaveClass(/meter--over/);
    await expect(budget.talkItThrough).toHaveAttribute('href', '/ask-giddy');

    await budget.swap('Professor Fizz’s Volcano Lab').click();
    const dialog = new SwapDialog(page);
    await expect(dialog.dialog).toContainText('Rexy the Dino Visit');
    await dialog.confirm.click();

    await expect(budget.overBudget).toHaveCount(0);
    await expect(budget.row('Rexy the Dino Visit')).toContainText('$150');
    await expect(budget.status).toHaveText('$27 left');
    await expect(budget.toast('Swapped to Rexy the Dino Visit')).toBeVisible();
    expect(fakeApi.partyStore.bookings.find((b) => b.category === 'Entertainer')!.name).toBe(
      'Rexy the Dino Visit',
    );
  });

  test('keeps the plan when the parent changes their mind', async ({ page, fakeApi }) => {
    fakeApi.budgetStore.expenses.set(dinoParty.id, [
      {
        id: 'cost-a',
        description: 'Balloon arch',
        category: 'Decorations',
        amount: 40,
        paid: false,
      },
    ]);
    const budget = new BudgetPage(page);
    await budget.openBudget(dinoParty.id);

    await budget.swap('Professor Fizz’s Volcano Lab').click();
    await new SwapDialog(page).cancel.click();

    await expect(budget.overBudget).toBeVisible();
    await expect(budget.row('Professor Fizz’s Volcano Lab')).toBeVisible();
  });
});

test.describe('budget accessibility', () => {
  for (const width of [360, 1280]) {
    test(`has no serious violations at ${width}px, over budget and in the dialog`, async ({
      page,
      fakeApi,
    }) => {
      fakeApi.budgetStore.expenses.set(dinoParty.id, [
        {
          id: 'cost-a',
          description: 'Balloon arch',
          category: 'Decorations',
          amount: 40,
          paid: false,
        },
      ]);
      const budget = new BudgetPage(page);
      await budget.useWidth(width);
      await budget.openBudget(dinoParty.id);
      await expect(budget.overBudget).toBeVisible();

      expect(await budget.seriousAccessibilityViolations()).toEqual([]);
      await budget.edit('Balloon arch').click();
      await expect(new CostDialog(page).dialog).toBeVisible();
      expect(await budget.seriousAccessibilityViolations()).toEqual([]);
    });
  }
});
