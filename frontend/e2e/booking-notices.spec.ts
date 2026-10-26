import { expect, test } from './fixtures/test';
import { dinoDenId } from './fixtures/seed-venues';
import { PartyOverviewPage } from './pages/party-overview.page';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

test.describe('booking updates on the party overview', () => {
  test('shows when a held slot expires and offers to book it', async ({ page, fakeApi }) => {
    fakeApi.bookingStore.seed(dinoParty, 'holding', 'tok_3ds');
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoParty);

    const hold = overview.notice('Dino Den Play Café is holding 1:00 pm for you');
    await expect(hold).toContainText(
      'The hold lasts until Tue 27 Oct, 4:00 pm. Pay the $100 deposit to lock it in.',
    );
    await expect(hold).toHaveAttribute('role', 'status');
    await expect(hold.getByRole('link', { name: 'Book now' })).toHaveAttribute(
      'href',
      `/venues/${dinoDenId}?date=2026-11-14&partyId=${dinoParty}`,
    );
  });

  test('shows the confirmation number once the venue confirms', async ({ page, fakeApi }) => {
    fakeApi.bookingStore.seed(dinoParty, 'confirmed');
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoParty);

    const confirmed = overview.notice('Dino Den Play Café confirmed your booking');
    await expect(confirmed).toContainText('Sat 14 Nov, 1:00–3:30 pm · confirmation DD-48213.');
    await expect(confirmed.getByRole('link', { name: 'See booking' })).toBeVisible();
  });

  test('remembers a dismissed confirmation', async ({ page, fakeApi }) => {
    fakeApi.bookingStore.seed(dinoParty, 'confirmed');
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoParty);

    await overview.dismissNotice('Dino Den Play Café confirmed your booking');

    await expect(overview.notice('confirmed your booking')).toHaveCount(0);
    await overview.openParty(dinoParty);
    await expect(overview.heading).toBeVisible();
    await expect(overview.notice('confirmed your booking')).toHaveCount(0);
  });

  test('keeps a declined deposit on screen until it is fixed', async ({ page, fakeApi }) => {
    fakeApi.bookingStore.seed(dinoParty, 'declined', 'tok_declined');
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoParty);

    const declined = overview.notice('Your deposit payment didn’t go through');
    await expect(declined).toHaveAttribute('role', 'alert');
    await expect(declined).toContainText(
      'Visa ending 0002 was declined, so Dino Den Play Café released the hold.',
    );
    await expect(declined.getByRole('button', { name: 'Dismiss' })).toHaveCount(0);
    await expect(declined.getByRole('link', { name: 'Try another card' })).toHaveAttribute(
      'href',
      `/venues/${dinoDenId}?date=2026-11-14&partyId=${dinoParty}`,
    );
  });

  test('warns about a disruption on the party day without letting it be dismissed', async ({
    page,
    fakeApi,
  }) => {
    fakeApi.bookingStore.seed(dinoParty, 'confirmed');
    fakeApi.bookingStore.disruptions.push({
      title: 'Sat 14 Nov is a TTC weekend closure on Queen St E',
      text: 'The 501 streetcar is replaced by buses between Broadview and Neville Park.',
    });
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoParty);

    const closure = overview.notice('Sat 14 Nov is a TTC weekend closure on Queen St E');
    await expect(closure).toContainText('The 501 streetcar is replaced by buses');
    await expect(closure.getByRole('button', { name: 'Dismiss' })).toHaveCount(0);
  });

  test('shows nothing when there is no booking', async ({ page }) => {
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoParty);

    await expect(overview.heading).toBeVisible();
    await expect(overview.bookingUpdates).toHaveCount(0);
  });

  test('passes accessibility checks with every kind of update', async ({ page, fakeApi }) => {
    fakeApi.bookingStore.seed(dinoParty, 'confirmed');
    fakeApi.bookingStore.disruptions.push({ title: 'TTC closure', text: 'Buses replace the 501.' });
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoParty);
    await expect(overview.notice('TTC closure')).toBeVisible();

    expect(await overview.seriousAccessibilityViolations()).toEqual([]);
  });
});
