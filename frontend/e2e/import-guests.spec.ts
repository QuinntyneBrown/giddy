import { expect, test } from './fixtures/test';
import { GuestsPage } from './pages/guests.page';
import { ImportGuestsDialog } from './pages/import-guests.dialog';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';
const classList = [
  'Child,Parent,Email,Mobile',
  'Maya Chen,Lily Chen,lily@example.com,',
  'Theo Laurent,Claire Laurent,claire@example.com,416-555-0102',
  'Nadia Karim,Samir Karim,samir@example.com,',
  'Omar Siddiqui,Huda Siddiqui,,',
  'Ruby Clarke,Emma Clarke,emma@example.com,',
].join('\n');

test.describe('importing guests', () => {
  test('checks a class list, names rows to fix and imports the rest', async ({ page, fakeApi }) => {
    const guests = new GuestsPage(page);
    const dialog = new ImportGuestsDialog(page);
    await guests.openGuests(dinoParty);
    await guests.importGuests.click();
    await expect(dialog.importButton).toBeDisabled();

    await dialog.chooseFile('Grade 2 Room 12 class list.csv', classList);

    await expect(dialog.dialog).toContainText('Grade 2 Room 12 class list.csv');
    await expect(dialog.dialog).toContainText('5 rows');
    await expect(dialog.warning).toContainText('1 row needs a parent email');
    await expect(dialog.warning).toContainText(
      'Row 5 (Omar Siddiqui) has no email. Fix it in the file, or import the rest and add it later.',
    );
    await expect(dialog.dialog).toContainText(
      'Maya Chen (row 2) is already on the list and will be skipped.',
    );
    await expect(dialog.importButton).toHaveText('Import 3 guests');
    await dialog.importButton.click();

    await expect(dialog.dialog).toContainText('3 guests imported');
    await expect(dialog.dialog).toContainText(
      'Skipped 2: Maya Chen (already on the list), Omar Siddiqui (no parent email).',
    );
    await dialog.done.click();
    await expect(guests.row('Theo Laurent')).toContainText('Not sent');
    expect(fakeApi.guestStore.uploads).toEqual(['Grade 2 Room 12 class list.csv']);
  });

  test('shows progress while the file uploads', async ({ page }) => {
    const guests = new GuestsPage(page);
    const dialog = new ImportGuestsDialog(page);
    await guests.openGuests(dinoParty);
    await guests.importGuests.click();
    await dialog.chooseFile('class.csv', classList);
    await expect(dialog.importButton).toHaveText('Import 3 guests');

    await dialog.importButton.click();

    await expect(dialog.progress).toBeVisible();
    await expect(dialog.progress).toHaveAttribute('aria-valuenow', /\d+/);
    await expect(dialog.dialog).toContainText('3 guests imported');
  });

  test('reuses guests from another of the family’s parties', async ({ page }) => {
    const guests = new GuestsPage(page);
    const dialog = new ImportGuestsDialog(page);
    await guests.openGuests(dinoParty);
    await guests.importGuests.click();

    await dialog.source('Zuri’s 6th: Mermaid Splash').check();
    await expect(dialog.source('Zuri’s 6th: Mermaid Splash')).toHaveAccessibleName(
      /Reuse 2 guests from Sat 15 Nov 2025/,
    );
    await expect(dialog.importButton).toHaveText('Import 2 guests');
    await dialog.importButton.click();

    await expect(dialog.dialog).toContainText('1 guest imported');
    await expect(dialog.dialog).toContainText('Skipped 1: Leo Rossi (already on the list).');
    await dialog.done.click();
    await expect(guests.row('Ines Duarte')).toBeVisible();
  });

  test('explains which files are accepted and imports nothing else', async ({ page, fakeApi }) => {
    const guests = new GuestsPage(page);
    const dialog = new ImportGuestsDialog(page);
    await guests.openGuests(dinoParty);
    await guests.importGuests.click();

    await dialog.chooseFile('class list.pdf', 'not a spreadsheet');

    await expect(dialog.problem).toContainText('Choose a .csv or .xlsx file up to 2 MB.');
    await expect(dialog.importButton).toBeDisabled();
    expect(fakeApi.guestStore.uploads).toEqual([]);
  });

  test('says when phone contacts aren’t available', async ({ page }) => {
    const guests = new GuestsPage(page);
    const dialog = new ImportGuestsDialog(page);
    await guests.openGuests(dinoParty);
    await guests.importGuests.click();

    await expect(dialog.contacts).toBeDisabled();
    await expect(dialog.contacts).toHaveAccessibleName(/Not available in this browser/);
  });

  test('passes accessibility checks', async ({ page }) => {
    const guests = new GuestsPage(page);
    const dialog = new ImportGuestsDialog(page);
    await guests.openGuests(dinoParty);
    await guests.importGuests.click();
    await dialog.chooseFile('class.csv', classList);
    await expect(dialog.warning).toBeVisible();

    expect(await guests.seriousAccessibilityViolations()).toEqual([]);
  });
});
