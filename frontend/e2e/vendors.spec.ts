import { expect, test } from './fixtures/test';
import { PartyOverviewPage } from './pages/party-overview.page';
import { RequestQuoteDialog } from './pages/request-quote.dialog';
import { VendorsPage } from './pages/vendors.page';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

test.describe('finding entertainers', () => {
  test('lists entertainers free that day for the party’s theme, with what parents need', async ({
    page,
  }) => {
    const vendors = new VendorsPage(page);
    await vendors.openVendors();

    await expect(vendors.subtitle).toHaveText(
      '3 entertainers free on Sat 14 Nov who travel to Leslieville',
    );
    await expect(vendors.chip('Entertainers')).toHaveAttribute('aria-pressed', 'true');
    await expect(vendors.chip('Dino Dig theme')).toHaveAttribute('aria-pressed', 'true');
    const fizz = vendors.result('Professor Fizz’s Volcano Lab');
    await expect(fizz).toContainText('In your plan');
    await expect(fizz).toContainText('4.9');
    await expect(fizz).toContainText('(187)');
    await expect(fizz).toContainText('45 min · ages 4–10');
    await expect(fizz).toContainText('$195');
    await expect(fizz).not.toContainText('Can’t meet');
    await expect(vendors.result('DJ Dance Party Dan')).toHaveCount(0);
  });

  test('can turn the theme filter off', async ({ page }) => {
    const vendors = new VendorsPage(page);
    await vendors.openVendors();

    await vendors.chip('Dino Dig theme').click();

    await expect(vendors.chip('Dino Dig theme')).toHaveAttribute('aria-pressed', 'false');
    await expect(vendors.result('DJ Dance Party Dan')).toBeVisible();
    await expect(vendors.subtitle).toHaveText(
      '4 entertainers free on Sat 14 Nov who travel to Leslieville',
    );
  });

  test('keeps the filters when nothing matches and says what to change', async ({
    page,
    fakeApi,
  }) => {
    fakeApi.vendorStore.vendors.find((v) => v.name === 'Paint Pals Face Painting')!.price = 250;
    const vendors = new VendorsPage(page);
    await vendors.openVendors();

    await vendors.chip('Activities').click();
    await vendors.chip('Under $200').click();

    await expect(vendors.emptyState).toContainText(
      'No activities under $200 for the Dino Dig theme',
    );
    await expect(vendors.chip('Under $200')).toBeVisible();
    await vendors.emptyState.getByRole('button', { name: 'Raise to $250' }).click();
    await expect(vendors.result('Paint Pals Face Painting')).toBeVisible();
  });
});

test.describe('food and cake', () => {
  test('lists each child’s allergy and whether every vendor can meet it', async ({ page }) => {
    const vendors = new VendorsPage(page);
    await vendors.openVendors('?category=food');

    await expect(vendors.subtitle).toHaveText(
      '2 bakeries and caterers that deliver to Dino Den Play Café',
    );
    await expect(vendors.allergyAlert).toContainText('3 guests have allergies');
    await expect(vendors.allergyAlert).toContainText(
      'Showing allergy info on every food vendor: dairy (Maya), gluten (Hana) and peanut (Arjun).',
    );
    await expect(vendors.result('Sweet Rex Bakery')).toContainText('Can’t meet: dairy, gluten');
    await expect(vendors.result('Sweet Rex Bakery')).toContainText('Nut-free · 5 days’ notice');
    await expect(vendors.result('Cupcake Cloud')).toContainText('Can’t meet: gluten, peanut');
    await expect(vendors.result('Cupcake Cloud')).toContainText(
      'Dairy-free · Vegan · 2 days’ notice',
    );
  });
});

test.describe('requesting a quote', () => {
  test('pre-fills the party details and adds the request to the plan', async ({
    page,
    fakeApi,
  }) => {
    const vendors = new VendorsPage(page);
    const dialog = new RequestQuoteDialog(page);
    await vendors.openVendors();

    await vendors.requestQuote('Rexy the Dino Visit');

    await expect(dialog.dialog).toHaveAccessibleName('Ask Rexy the Dino Visit for a quote');
    await expect(dialog.date).toHaveValue('2026-11-14');
    await expect(dialog.start).toHaveValue('14:15');
    await expect(dialog.kids).toHaveValue('16');
    await expect(dialog.where).toHaveValue('Dino Den Play Café');
    await expect(dialog.message).toHaveValue(
      'Hi! It’s Zuri’s 7th, a Dino Dig party at Dino Den Play Café. Could you come at 2:15 pm?',
    );
    await dialog.send.click();

    await expect(dialog.dialog).toContainText('Request sent to Rexy the Dino Visit');
    await expect(dialog.dialog).toContainText('Rexy the Dino Visit usually replies within a day.');
    await dialog.done.click();
    await expect(vendors.result('Rexy the Dino Visit')).toContainText('Quote requested');
    expect(fakeApi.vendorStore.quoteRequests.at(-1)).toMatchObject({
      vendorId: 'c1000000-0000-4000-8000-000000000003',
      start: '14:15',
      kids: 16,
    });
  });

  test('explains the allowed window when the start time is outside the venue booking', async ({
    page,
  }) => {
    const vendors = new VendorsPage(page);
    const dialog = new RequestQuoteDialog(page);
    await vendors.openVendors();
    await vendors.requestQuote('Rexy the Dino Visit');

    await dialog.start.fill('16:00');
    await dialog.send.click();

    expect(await dialog.fieldError(dialog.start)).toBe(
      'Choose a start time between 1:00 and 3:30 pm, while you have the venue.',
    );
    await expect(dialog.start).toHaveAttribute('aria-invalid', 'true');
  });

  test('says when a request is already pending', async ({ page, fakeApi }) => {
    fakeApi.vendorStore.pending.add('c1000000-0000-4000-8000-000000000003');
    const vendors = new VendorsPage(page);
    const dialog = new RequestQuoteDialog(page);
    await vendors.openVendors();
    await vendors.requestQuote('Rexy the Dino Visit');

    await dialog.send.click();

    await expect(dialog.problem).toContainText(
      'You asked Rexy the Dino Visit for a quote less than a day ago, so a request is pending.',
    );
  });
});

test.describe('quotes on the party overview', () => {
  test('a quote about to expire offers to confirm it or find another', async ({
    page,
    fakeApi,
  }) => {
    let confirmed = false;
    fakeApi.respond('GET', '/api/parties/:partyId/booking-notices', () => ({
      body: confirmed
        ? []
        : [
            {
              kind: 'quote-expiring',
              tone: 'warning',
              title: 'Professor Fizz’s Volcano Lab’s quote expires in 2 days',
              text: 'Confirm by Tue 27 Oct to keep it, or find another entertainer.',
              dismissible: true,
              bookingId: null,
              venueId: 'c1000000-0000-4000-8000-000000000001',
              quoteId: 'q-fizz',
              category: 'Entertainer',
            },
          ],
    }));
    fakeApi.respond('POST', '/api/parties/:partyId/quotes/:quoteId/confirm', () => {
      confirmed = true;
      return { status: 204 };
    });
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoParty);

    const expiring = overview.notice('Professor Fizz’s Volcano Lab’s quote expires in 2 days');
    await expect(expiring.getByRole('link', { name: 'Find another' })).toHaveAttribute(
      'href',
      `/vendors?category=entertainers&partyId=${dinoParty}`,
    );
    await expiring.getByRole('button', { name: 'Confirm' }).click();

    await expect(overview.notice('quote expires')).toHaveCount(0);
  });

  test('a requested quote shows in the plan', async ({ page, fakeApi }) => {
    fakeApi.partyStore.bookings[1].status = 'quoteRequested';
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoParty);

    await expect(overview.bookingRow('Entertainer')).toContainText('Quote requested');
  });
});

for (const width of [360, 1280]) {
  test(`Fun & food passes accessibility checks at ${width}px`, async ({ page }) => {
    const vendors = new VendorsPage(page);
    const dialog = new RequestQuoteDialog(page);
    await vendors.useWidth(width);
    await vendors.openVendors('?category=food');
    await expect(vendors.allergyAlert).toBeVisible();
    expect(await vendors.seriousAccessibilityViolations()).toEqual([]);
    expect(await vendors.scrollsSideways()).toBe(false);

    await vendors.requestQuote('Sweet Rex Bakery');
    await expect(dialog.dialog).toBeVisible();
    expect(await vendors.seriousAccessibilityViolations()).toEqual([]);
  });
}
