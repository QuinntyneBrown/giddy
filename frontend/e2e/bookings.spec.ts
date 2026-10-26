import { expect, test } from './fixtures/test';
import { dinoDenId } from './fixtures/seed-venues';
import { BookVenueDialog } from './pages/book-venue.dialog';
import { VenueDetailPage } from './pages/venue-detail.page';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';
const forDino = `?date=2026-11-14&partyId=${dinoParty}`;

test.describe('booking a venue', () => {
  test('shows the slot and pre-fills the booking from the party', async ({ page }) => {
    const venue = new VenueDetailPage(page);
    const dialog = new BookVenueDialog(page);
    await venue.openVenue(dinoDenId, forDino);

    await expect(venue.bookButton()).toHaveText('Book 1:00–3:30 pm');
    await expect(venue.bookingCard).toContainText(
      '$100 deposit today, free cancellation until Sat 31 Oct.',
    );
    await venue.book();

    await expect(dialog.heading('Book Dino Den Play Café for Zuri’s party')).toBeVisible();
    await expect(dialog.summary).toContainText('Dino Den Play Café');
    await expect(dialog.summary).toContainText('$340');
    await expect(dialog.summary).toContainText(
      'Sat 14 Nov 2026 · 1:00–3:30 pm · Fossil Room · up to 20 kids',
    );
    await expect(dialog.bookingName).toHaveValue('Amara Okafor');
    await expect(dialog.child).toHaveValue('Zuri, turning 7');
    await expect(dialog.notes).toHaveValue('Peanut allergy in the group.');
    await expect(dialog.savedCard('Visa ending 4242')).toBeChecked();
    await expect(dialog.pay).toHaveText('Pay $100 and book');
  });

  test('books with a saved card and confirms it', async ({ page, fakeApi }) => {
    const venue = new VenueDetailPage(page);
    const dialog = new BookVenueDialog(page);
    await venue.openVenue(dinoDenId, forDino);
    await venue.book();

    await dialog.mobile.fill('416-555-0188');
    await dialog.pay.click();

    await expect(dialog.heading('You’re booked! 🎉')).toBeVisible();
    await expect(dialog.dialog).toContainText(
      'Dino Den Play Café is booked for Sat 14 Nov, 1:00–3:30 pm!',
    );
    await expect(dialog.dialog).toContainText('Confirmation DD-48213 is in your email.');
    await expect(dialog.dialog).toContainText(
      'Giddy added “Share the allergy list” to your checklist.',
    );
    await expect(dialog.backToPlan).toHaveAttribute('href', `/parties/${dinoParty}`);
    expect(fakeApi.bookingStore.requests).toEqual([
      {
        venueId: dinoDenId,
        date: '2026-11-14',
        start: '13:00',
        bookingName: 'Amara Okafor',
        mobile: '416-555-0188',
        child: 'Zuri, turning 7',
        notes: 'Peanut allergy in the group.',
        payment: {
          token: null,
          savedCardId: 'c1000000-0000-4000-8000-000000000001',
          saveCard: false,
        },
      },
    ]);

    await dialog.close.click();

    await expect(venue.yourBooking()).toContainText('Booked for Sat 14 Nov, 1:00–3:30 pm');
    await expect(venue.yourBooking()).toContainText(
      'Confirmation DD-48213. Deposit of $100 paid; $240 due on the day.',
    );
    await expect(venue.yourBooking()).toContainText('Bea at 416-555-0142');
  });

  test('checks the mobile number before anything is paid', async ({ page, fakeApi }) => {
    const venue = new VenueDetailPage(page);
    const dialog = new BookVenueDialog(page);
    await venue.openVenue(dinoDenId, forDino);
    await venue.book();

    await dialog.pay.click();

    await expect(dialog.errorSummary).toContainText(
      'Add a mobile number so Dino Den Play Café can reach you on the day',
    );
    await expect(dialog.mobile).toHaveAttribute('aria-invalid', 'true');
    await dialog.mobile.fill('555-01');
    await dialog.pay.click();
    await expect(dialog.errorSummary).toContainText(
      'Enter a 10-digit mobile number, like 416-555-0188',
    );
    expect(fakeApi.bookingStore.requests).toEqual([]);
  });

  test('stays open and busy while the deposit is paid', async ({ page, fakeApi }) => {
    const venue = new VenueDetailPage(page);
    const dialog = new BookVenueDialog(page);
    fakeApi.bookingStore.delayMs = 1500;
    await venue.openVenue(dinoDenId, forDino);
    await venue.book();
    await dialog.mobile.fill('416-555-0188');

    await dialog.pay.click();

    await expect(dialog.pay).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.cancel).toBeDisabled();
    await dialog.pressEscape();
    await expect(dialog.dialog).toBeVisible();
    await expect(dialog.heading('You’re booked! 🎉')).toBeVisible();
  });

  test('passes accessibility checks', async ({ page }) => {
    const venue = new VenueDetailPage(page);
    const dialog = new BookVenueDialog(page);
    await venue.openVenue(dinoDenId, forDino);
    await venue.book();
    await expect(dialog.dialog).toBeVisible();

    expect(await venue.seriousAccessibilityViolations()).toEqual([]);
  });
});
