import { expect, test } from './fixtures/test';
import { GuestsPage } from './pages/guests.page';
import { RemoveGuestDialog } from './pages/remove-guest.dialog';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

test.describe('finding guests', () => {
  test('lists guests by child name and filters as the parent types', async ({ page }) => {
    const guests = new GuestsPage(page);
    await guests.openGuests(dinoParty);
    expect((await guests.childNames()).slice(0, 3)).toEqual([
      'Aisha Mohamed',
      'Amelia Singh',
      'Arjun Patel',
    ]);

    await guests.search.fill('chen');
    await expect(guests.rows()).toHaveCount(1);
    await expect(guests.row('Maya Chen')).toBeVisible();
    await guests.search.fill('Kenji');
    await expect(guests.rows()).toHaveCount(1);
    await expect(guests.row('Hana Sato')).toBeVisible();
  });

  test('filters by reply or allergy with a count on each chip', async ({ page }) => {
    const guests = new GuestsPage(page);
    await guests.openGuests(dinoParty);

    await expect(guests.chip('All')).toHaveText('All 16');
    await expect(guests.chip('Coming')).toHaveText('Coming 11');
    await expect(guests.chip('Waiting')).toHaveText('Waiting 3');
    await expect(guests.chip('Allergies')).toHaveText('Allergies 3');
    await guests.chip('Waiting').click();

    await expect(guests.chip('Waiting')).toHaveAttribute('aria-pressed', 'true');
    await expect
      .poll(() => guests.childNames())
      .toEqual(['Aisha Mohamed', 'Ava Wilson', 'Mateo García']);
    await guests.chip('Allergies').click();
    await expect.poll(() => guests.childNames()).toEqual(['Arjun Patel', 'Hana Sato', 'Maya Chen']);
  });

  test('offers to clear the search or add the name when nothing matches', async ({ page }) => {
    const guests = new GuestsPage(page);
    await guests.openGuests(dinoParty);

    await guests.search.fill('Zed');

    await expect(guests.emptyState).toContainText('No guests match “Zed”');
    await expect(
      guests.emptyState.getByRole('button', { name: 'Add “Zed” as a guest' }),
    ).toBeVisible();
    await guests.emptyState.getByRole('button', { name: 'Clear search' }).click();
    await expect(guests.rows()).toHaveCount(16);
    await expect(guests.search).toHaveValue('');
  });

  test('a party with no guests offers to add the first or import a class list', async ({
    page,
    fakeApi,
  }) => {
    fakeApi.guestStore.empty();
    const guests = new GuestsPage(page);
    await guests.openGuests(dinoParty);

    await expect(
      guests.emptyState.getByRole('button', { name: 'Add the first guest' }),
    ).toBeVisible();
    await expect(
      guests.emptyState.getByRole('button', { name: 'Import a class list' }),
    ).toBeVisible();
  });
});

test.describe('acting on a guest', () => {
  test('each row can message the parent and remove the guest, named for the child', async ({
    page,
  }) => {
    const guests = new GuestsPage(page);
    await guests.openGuests(dinoParty);

    await expect(guests.rowAction('Maya Chen', 'Message')).toHaveAttribute(
      'href',
      'mailto:lily@example.com',
    );
    await expect(guests.rowAction('Maya Chen', 'Remove')).toBeVisible();
  });

  test('removing asks first, says the parent won’t be messaged, and can be undone', async ({
    page,
    fakeApi,
  }) => {
    const guests = new GuestsPage(page);
    const dialog = new RemoveGuestDialog(page);
    await guests.openGuests(dinoParty);

    await guests.rowAction('Maya Chen', 'Remove').click();
    await expect(dialog.dialog).toHaveAccessibleName('Remove Maya Chen?');
    await expect(dialog.dialog).toContainText('Lily Chen won’t be messaged.');
    await expect(dialog.cancel).toBeFocused();
    await dialog.remove.click();

    await expect(guests.row('Maya Chen')).toHaveCount(0);
    await expect(guests.subtitle).toHaveText('15 invited · 10 coming · 3 waiting · 2 can’t come');
    const removed = guests.toast('Maya Chen removed');
    await removed.getByRole('button', { name: 'Undo' }).click();
    await expect(guests.row('Maya Chen')).toContainText('Coming');
    await expect(guests.subtitle).toHaveText('16 invited · 11 coming · 3 waiting · 2 can’t come');
    expect(fakeApi.guestStore.removed).toEqual([]);
  });

  test('the undo offer disappears after eight seconds', async ({ page }) => {
    const guests = new GuestsPage(page);
    const dialog = new RemoveGuestDialog(page);
    await guests.openGuests(dinoParty);
    await guests.rowAction('Leo Rossi', 'Remove').click();
    await dialog.remove.click();

    await expect(guests.toast('Leo Rossi removed')).toBeVisible();
    await expect(guests.toast('Leo Rossi removed')).toHaveCount(0, { timeout: 10_000 });
  });
});

test('the remove dialog passes accessibility checks', async ({ page }) => {
  const guests = new GuestsPage(page);
  const dialog = new RemoveGuestDialog(page);
  await guests.openGuests(dinoParty);
  await guests.rowAction('Maya Chen', 'Remove').click();
  await expect(dialog.dialog).toBeVisible();

  expect(await guests.seriousAccessibilityViolations()).toEqual([]);
});
