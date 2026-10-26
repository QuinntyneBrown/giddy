import { expect, test } from './fixtures/test';
import { GuestsPage } from './pages/guests.page';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

test.describe('the guest list', () => {
  test('shows every family with their reply, allergies and the counts', async ({ page }) => {
    const guests = new GuestsPage(page);
    await guests.openGuests(dinoParty);

    await expect(guests.heading).toBeVisible();
    await expect(guests.subtitle).toHaveText('16 invited · 11 coming · 3 waiting · 2 can’t come');
    await expect(guests.sections.getByRole('link', { name: 'Guests' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(guests.sections.getByRole('link', { name: 'Overview' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(guests.tally).toContainText('11Coming');
    await expect(guests.tally).toContainText('3Waiting');
    await expect(guests.tally).toContainText('2Can’t come');
    await expect(guests.table.getByRole('row')).toHaveCount(17);
    await expect(guests.row('Maya Chen')).toContainText('Coming');
    await expect(guests.row('Maya Chen')).toContainText('Dairy-free');
    await expect(guests.row('Maya Chen')).toContainText('Lily Chen');
    await expect(guests.row('Aisha Mohamed')).toContainText('Waiting');
    await expect(guests.row('Ethan Kim')).toContainText('Can’t come');
    await expect(guests.row('Leo Rossi')).toContainText('None');
    await expect(guests.allergyList).toContainText(
      'Arjun · Peanut (EpiPen with parent) · Hana · Gluten-free (celiac) · Maya · Dairy-free',
    );
  });

  test('sends the allergy list to the venue', async ({ page, fakeApi }) => {
    const guests = new GuestsPage(page);
    await guests.openGuests(dinoParty);

    await guests.sendAllergyList.click();

    await expect(guests.toast('Allergy list sent to Dino Den Play Café')).toContainText(
      'First names and allergies only, no contact details.',
    );
    expect(fakeApi.guestStore.allergyListShares).toBe(1);
  });

  test('viewers see the list but cannot select, remind or share', async ({ page, fakeApi }) => {
    fakeApi.partyStore.parties[0].role = 'viewer';
    const guests = new GuestsPage(page);
    await guests.openGuests(dinoParty);

    await expect(guests.row('Maya Chen')).toBeVisible();
    await expect(guests.checkboxes()).toHaveCount(0);
    await expect(guests.sendAllergyList).toHaveCount(0);
  });
});

test.describe('reminding families', () => {
  test('shows who is selected and can clear the selection', async ({ page }) => {
    const guests = new GuestsPage(page);
    await guests.openGuests(dinoParty);

    await guests.select('Aisha Mohamed', 'Mateo García', 'Ava Wilson');

    await expect(guests.selectionBar).toContainText('3 guests selected');
    await expect(guests.selectionBar).toContainText('Aisha, Mateo and Ava');
    await expect(guests.sendReminder).toHaveText('Send reminder (3)');
    await guests.clearSelection.click();
    await expect(guests.sendReminder).toHaveCount(0);
    await expect(guests.checkboxes().first()).not.toBeChecked();
  });

  test('says when reminders go out and when they are sent', async ({ page, fakeApi }) => {
    fakeApi.respond('POST', '/api/parties/:partyId/reminders', (request) => ({
      delayMs: 800,
      body: {
        reminded: ['Aisha', 'Mateo'],
        skipped: [],
        undeliverable: [],
        ...(request.postDataJSON() ? {} : {}),
      },
    }));
    const guests = new GuestsPage(page);
    await guests.openGuests(dinoParty);
    await guests.select('Aisha Mohamed', 'Mateo García');

    await guests.sendReminder.click();

    await expect(guests.toast('Sending 2 reminders now')).toBeVisible();
    const sent = guests.toast('Reminders sent');
    await expect(sent).toContainText('Aisha and Mateo’s families will get a reminder.');
    await expect(sent.getByRole('link', { name: 'View guests' })).toBeVisible();
    await expect(guests.sendReminder).toHaveCount(0);
  });

  test('skips families reminded in the last 48 hours and says why', async ({ page, fakeApi }) => {
    fakeApi.guestStore.guests.find((g) => g.childName === 'Mateo García')!.lastRemindedAt =
      new Date().toISOString();
    const guests = new GuestsPage(page);
    await guests.openGuests(dinoParty);
    await guests.select('Aisha Mohamed', 'Mateo García');

    await guests.sendReminder.click();

    await expect(guests.toast('Reminders sent')).toContainText(
      'Skipped Mateo: reminded less than 48 hours ago.',
    );
  });

  test('names families who cannot be reached and keeps saying so', async ({ page }) => {
    const guests = new GuestsPage(page);
    await guests.openGuests(dinoParty);
    await guests.select('Ava Wilson');

    await guests.sendReminder.click();

    const failed = guests.toast('We couldn’t remind Ava’s family');
    await expect(failed).toContainText('No email or mobile number.');
    await expect(failed.getByRole('link', { name: 'Fix details' })).toBeVisible();
    await page.waitForTimeout(6000);
    await expect(failed).toBeVisible();
    await failed.getByRole('button', { name: 'Dismiss' }).click();
    await expect(failed).toHaveCount(0);
  });
});

for (const width of [360, 1280]) {
  test(`the guest list passes accessibility checks at ${width}px`, async ({ page }) => {
    const guests = new GuestsPage(page);
    await guests.useWidth(width);
    await guests.openGuests(dinoParty);
    await guests.select('Aisha Mohamed');
    await expect(guests.sendReminder).toBeVisible();

    expect(await guests.seriousAccessibilityViolations()).toEqual([]);
    expect(await guests.scrollsSideways()).toBe(false);
  });
}
