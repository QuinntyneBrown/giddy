import { expect, test } from './fixtures/test';
import { AddChildDialog } from './pages/add-child.dialog';
import { FamilyPage } from './pages/family.page';
import { WelcomePage } from './pages/welcome.page';

test.describe('the family', () => {
  test('shows each child with their next birthday, interests and party', async ({ page }) => {
    const family = new FamilyPage(page);
    await family.openFamily();

    await expect(family.subtitle).toHaveText('2 kids');
    await expect(family.child('Zuri')).toContainText('Turns 7 on Sat 14 Nov 2026 · in 20 days');
    await expect(family.child('Zuri')).toContainText('Dinosaurs');
    await expect(family.child('Zuri').getByRole('link', { name: 'Party planned' })).toHaveAttribute(
      'href',
      '/parties/3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6',
    );
    await expect(
      family.child('Kofi').getByRole('link', { name: 'Plan Kofi’s party' }),
    ).toBeVisible();
  });

  test('adds a child with up to five interests', async ({ page }) => {
    const family = new FamilyPage(page);
    await family.openFamily();

    await family.addChild.click();
    const dialog = new AddChildDialog(page);
    await dialog.firstName.fill('Ama');
    await dialog.birthday.fill('2021-12-20');
    for (const name of ['Dinosaurs', 'Art', 'Space', 'Trains', 'Ocean'])
      await dialog.interest(name).check();
    await dialog.interest('Sports').click();
    await expect(dialog.interest('Sports')).not.toBeChecked();
    await expect(dialog.interestsHint).toContainText('Pick up to 5');
    await dialog.allergies.fill('Egg');
    await dialog.save.click();

    await expect(dialog.dialog).toHaveCount(0);
    await expect(family.child('Ama')).toContainText('Turns 5 on Sun 20 Dec 2026 · in 56 days');
    await expect(family.child('Ama')).toContainText('Egg');
  });

  test('explains a birthday that isn’t in the past and a missing name', async ({ page }) => {
    const family = new FamilyPage(page);
    await family.openFamily();

    await family.addChild.click();
    const dialog = new AddChildDialog(page);
    await dialog.birthday.fill('2027-01-01');
    await dialog.save.click();

    await expect(dialog.firstName).toHaveAccessibleDescription(/Enter your child’s first name/);
    await expect(dialog.birthday).toHaveAccessibleDescription(/Enter a birthday in the past/);
  });

  test('keeps everything entered when saving fails', async ({ page, fakeApi }) => {
    fakeApi.familyStore.failSaves = true;
    const family = new FamilyPage(page);
    await family.openFamily();

    await family.addChild.click();
    const dialog = new AddChildDialog(page);
    await dialog.firstName.fill('Ama');
    await dialog.birthday.fill('2021-12-20');
    await dialog.interest('Art').check();
    await dialog.save.click();

    await expect(dialog.problem).toContainText('That didn’t go through');
    await expect(dialog.firstName).toHaveValue('Ama');
    await expect(dialog.interest('Art')).toBeChecked();
    fakeApi.familyStore.failSaves = false;
    await dialog.save.click();
    await expect(family.child('Ama')).toBeVisible();
  });

  test('edits and removes a child', async ({ page }) => {
    const family = new FamilyPage(page);
    await family.openFamily();

    await family.edit('Kofi').click();
    const dialog = new AddChildDialog(page);
    await expect(dialog.firstName).toHaveValue('Kofi');
    await dialog.allergies.fill('Sesame');
    await dialog.save.click();
    await expect(family.child('Kofi')).toContainText('Sesame');

    await family.edit('Kofi').click();
    await dialog.remove.click();
    await expect(family.child('Kofi')).toHaveCount(0);
  });

  test('a family without kids is invited to add one', async ({ page, fakeApi }) => {
    fakeApi.partyStore.family.children = [];
    const family = new FamilyPage(page);
    await family.openFamily();

    await expect(family.emptyState).toContainText('Add your kids to get birthday reminders');
    await expect(family.emptyState.getByRole('button', { name: 'Add a child' })).toBeVisible();
  });
});

test.describe('family setup', () => {
  test('adds the kids, then goes home', async ({ page, fakeApi }) => {
    fakeApi.partyStore.family.children = [];
    const welcome = new WelcomePage(page);
    await welcome.openWelcome();

    await welcome.addChild.click();
    const dialog = new AddChildDialog(page);
    await dialog.firstName.fill('Zuri');
    await dialog.birthday.fill('2019-11-14');
    await dialog.save.click();

    await expect(welcome.children).toHaveCount(1);
    await expect(welcome.children.first()).toContainText('Zuri');
    await welcome.done.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('can be skipped', async ({ page, fakeApi }) => {
    fakeApi.partyStore.family.children = [];
    const welcome = new WelcomePage(page);
    await welcome.openWelcome();

    await welcome.skip.click();

    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('family accessibility', () => {
  for (const width of [360, 1280]) {
    test(`the family page and dialog have no serious violations at ${width}px`, async ({
      page,
    }) => {
      const family = new FamilyPage(page);
      await family.useWidth(width);
      await family.openFamily();
      await expect(family.child('Zuri')).toBeVisible();
      expect(await family.seriousAccessibilityViolations()).toEqual([]);

      await family.addChild.click();
      await expect(new AddChildDialog(page).dialog).toBeVisible();
      expect(await family.seriousAccessibilityViolations()).toEqual([]);
    });
  }
});
