import { expect, test } from './fixtures/test';
import { problem } from './fixtures/fake-api';
import { dinoDenId } from './fixtures/seed-venues';
import { CancelBookingDialog } from './pages/cancel-booking.dialog';
import { VenueDetailPage } from './pages/venue-detail.page';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';
const forDino = `?date=2026-11-14&partyId=${dinoParty}`;

test.describe('cancelling a booking', () => {
  test('refunds the deposit inside the free-cancellation window', async ({ page, fakeApi }) => {
    fakeApi.bookingStore.seed(dinoParty, 'confirmed');
    const venue = new VenueDetailPage(page);
    const dialog = new CancelBookingDialog(page);
    await venue.openVenue(dinoDenId, forDino);

    await venue.cancelBooking();

    await expect(dialog.dialog).toHaveAccessibleName('Cancel the Dino Den Play Café booking?');
    await expect(dialog.dialog).toHaveAccessibleDescription(
      'Sat 14 Nov, 1:00–3:30 pm · confirmation DD-48213',
    );
    await expect(dialog.dialog).toContainText(
      'You’re inside the free-cancellation window, so the $100 deposit goes back to Visa ending 4242.',
    );
    await expect(dialog.keep).toBeFocused();
    await expect(dialog.confirm).toHaveText('Cancel and refund $100');
    await dialog.confirm.click();

    await expect(dialog.dialog).toBeHidden();
    await expect(venue.toast()).toContainText('Booking cancelled');
    await expect(venue.toast()).toContainText(
      'The $100 deposit is on its way back to Visa ending 4242.',
    );
    await expect(venue.bookButton()).toHaveText('Book 1:00–3:30 pm');
  });

  test('says the deposit is non-refundable before the parent confirms', async ({
    page,
    fakeApi,
  }) => {
    fakeApi.bookingStore.refundable = false;
    fakeApi.bookingStore.seed(dinoParty, 'confirmed');
    const venue = new VenueDetailPage(page);
    const dialog = new CancelBookingDialog(page);
    await venue.openVenue(dinoDenId, forDino);

    await venue.cancelBooking();

    await expect(dialog.dialog).toContainText('The $100 deposit is non-refundable');
    await expect(dialog.dialog).toContainText(
      'Free cancellation ended Sat 31 Oct, so Dino Den Play Café keeps the deposit if you cancel now.',
    );
    await expect(dialog.confirm).toHaveText('Cancel without a refund');
    await dialog.confirm.click();
    await expect(venue.toast()).toContainText('Dino Den Play Café keeps the $100 deposit.');
  });

  test('keeps the booking when the parent changes their mind', async ({ page, fakeApi }) => {
    const booking = fakeApi.bookingStore.seed(dinoParty, 'confirmed');
    const venue = new VenueDetailPage(page);
    const dialog = new CancelBookingDialog(page);
    await venue.openVenue(dinoDenId, forDino);
    await venue.cancelBooking();

    await dialog.keep.click();

    await expect(dialog.dialog).toBeHidden();
    await expect(venue.yourBooking()).toContainText('Booked for Sat 14 Nov');
    expect(booking.state).toBe('confirmed');
  });

  test('keeps the booking and says so when cancelling fails', async ({ page, fakeApi }) => {
    fakeApi.bookingStore.seed(dinoParty, 'confirmed');
    fakeApi.respond('POST', '/api/parties/:partyId/bookings/:bookingId/cancel', {
      status: 500,
      body: problem(500, 'Something went wrong on our side. Your plans are safe.', {
        referenceCode: 'GDY-7Q2K',
      }),
    });
    const venue = new VenueDetailPage(page);
    const dialog = new CancelBookingDialog(page);
    await venue.openVenue(dinoDenId, forDino);
    await venue.cancelBooking();

    await dialog.confirm.click();

    await expect(dialog.dialog).toBeHidden();
    await expect(venue.toast()).toContainText('We couldn’t cancel the booking');
    await expect(venue.toast()).toContainText('It’s still booked; try again in a moment.');
    await expect(venue.yourBooking()).toContainText('Booked for Sat 14 Nov');
  });

  test('passes accessibility checks', async ({ page, fakeApi }) => {
    fakeApi.bookingStore.seed(dinoParty, 'confirmed');
    const venue = new VenueDetailPage(page);
    const dialog = new CancelBookingDialog(page);
    await venue.openVenue(dinoDenId, forDino);
    await expect(venue.yourBooking()).toBeVisible();
    expect(await venue.seriousAccessibilityViolations()).toEqual([]);

    await venue.cancelBooking();
    await expect(dialog.dialog).toBeVisible();
    expect(await venue.seriousAccessibilityViolations()).toEqual([]);
  });
});
