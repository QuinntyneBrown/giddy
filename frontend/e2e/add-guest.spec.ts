import { expect, test } from './fixtures/test';
import { AddGuestDialog } from './pages/add-guest.dialog';
import { GuestsPage } from './pages/guests.page';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

test.describe('adding a guest', () => {
  test('adds and invites a family when invitations have gone out', async ({ page, fakeApi }) => {
    const guests = new GuestsPage(page);
    const dialog = new AddGuestDialog(page);
    await guests.openGuests(dinoParty);

    await guests.addGuest.click();
    await expect(dialog.child).toBeFocused();
    await dialog.child.fill('Samira Haddad');
    await dialog.parent.fill('Rania Haddad');
    await dialog.email.fill('rania.haddad@example.com');
    await dialog.mobile.fill('416-555-0131');
    await expect(dialog.sendNow).toBeChecked();
    await expect(dialog.sendNow).toHaveAccessibleName(
      /Invites already went out on Tue 20 Oct; Samira gets the same one\./,
    );
    await dialog.save.click();

    await expect(dialog.dialog).toBeHidden();
    await expect(guests.row('Samira Haddad')).toContainText('Waiting');
    await expect(guests.toast('Samira Haddad added')).toBeVisible();
    expect(fakeApi.guestStore.guests.find((g) => g.childName === 'Samira Haddad')?.mobile).toBe(
      '416-555-0131',
    );
  });

  test('adds a family as not sent yet before invitations go out', async ({ page, fakeApi }) => {
    fakeApi.guestStore.notInvitedYet();
    const guests = new GuestsPage(page);
    const dialog = new AddGuestDialog(page);
    await guests.openGuests(dinoParty);

    await guests.addGuest.click();
    await expect(dialog.sendNow).toHaveCount(0);
    await dialog.child.fill('Samira Haddad');
    await dialog.parent.fill('Rania Haddad');
    await dialog.email.fill('rania.haddad@example.com');
    await expect(dialog.save).toHaveText('Add guest');
    await dialog.save.click();

    await expect(guests.row('Samira Haddad')).toContainText('Not sent');
  });

  test('checks the email and Canadian mobile before adding', async ({ page, fakeApi }) => {
    const guests = new GuestsPage(page);
    const dialog = new AddGuestDialog(page);
    await guests.openGuests(dinoParty);
    await guests.addGuest.click();

    await dialog.child.fill('Samira Haddad');
    await dialog.parent.fill('Rania Haddad');
    await dialog.email.fill('rania');
    await dialog.mobile.fill('212-555-0131');
    await dialog.save.click();

    await expect(dialog.errorSummary).toContainText('Enter an email like name@example.com');
    await expect(dialog.errorSummary).toContainText(
      'Enter a Canadian mobile number, like 416-555-0131, or leave it blank',
    );
    await expect(dialog.email).toHaveAttribute('aria-invalid', 'true');
    expect(fakeApi.guestStore.guests).toHaveLength(16);
  });

  test('says when the guest is already on the list', async ({ page }) => {
    const guests = new GuestsPage(page);
    const dialog = new AddGuestDialog(page);
    await guests.openGuests(dinoParty);
    await guests.addGuest.click();

    await dialog.child.fill('Maya Chen');
    await dialog.parent.fill('Lily Chen');
    await dialog.email.fill('lily@example.com');
    await dialog.save.click();

    await expect(dialog.problem).toContainText('Maya Chen is already on the list.');
    await expect(dialog.dialog).toBeVisible();
  });

  test('says the list holds up to 60 guests', async ({ page, fakeApi }) => {
    const store = fakeApi.guestStore;
    for (let i = store.guests.length; i < 60; i++)
      store.guests.push({
        ...store.guests[0],
        id: `extra-${i}`,
        childName: `Child ${i}`,
        email: `p${i}@example.com`,
      });
    const guests = new GuestsPage(page);
    const dialog = new AddGuestDialog(page);
    await guests.openGuests(dinoParty);
    await guests.addGuest.click();

    await dialog.child.fill('Samira Haddad');
    await dialog.parent.fill('Rania Haddad');
    await dialog.email.fill('rania.haddad@example.com');
    await dialog.save.click();

    await expect(dialog.problem).toContainText('The guest list holds up to 60 guests.');
  });

  test('pre-fills the name searched for', async ({ page }) => {
    const guests = new GuestsPage(page);
    const dialog = new AddGuestDialog(page);
    await guests.openGuests(dinoParty);

    await guests.search.fill('Zed Okoro');
    await guests.emptyState.getByRole('button', { name: 'Add “Zed Okoro” as a guest' }).click();

    await expect(dialog.child).toHaveValue('Zed Okoro');
  });

  test('passes accessibility checks', async ({ page }) => {
    const guests = new GuestsPage(page);
    const dialog = new AddGuestDialog(page);
    await guests.openGuests(dinoParty);
    await guests.addGuest.click();
    await expect(dialog.dialog).toBeVisible();

    expect(await guests.seriousAccessibilityViolations()).toEqual([]);
  });
});
