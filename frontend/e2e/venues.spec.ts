import { expect, test } from './fixtures/test';
import { problem } from './fixtures/fake-api';
import { danforthId, dinoDenId } from './fixtures/seed-venues';
import { CompareVenuesPage } from './pages/compare-venues.page';
import { VenueDetailPage } from './pages/venue-detail.page';
import { VenuesPage } from './pages/venues.page';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

test.describe('searching venues', () => {
  test('pre-fills the filters from the party and lists venues free that day', async ({
    page,
    fakeApi,
  }) => {
    const venues = new VenuesPage(page);
    await venues.openVenues();

    await expect(venues.date).toHaveValue('2026-11-14');
    await expect(venues.kids).toHaveValue('16');
    await expect(venues.subtitle).toHaveText('5 venues free on Sat 14 Nov near Leslieville');
    expect(fakeApi.venueStore.searches.at(-1)?.get('partyId')).toBe(dinoParty);
  });

  test('shows what a parent needs on each venue', async ({ page }) => {
    const venues = new VenuesPage(page);
    await venues.openVenues();

    const dino = venues.result('Dino Den Play Café');
    await expect(dino).toContainText('Leslieville · 1.1 km · Up to 20 kids · ages 3–9');
    await expect(dino).toContainText('4.8');
    await expect(dino).toContainText('(212)');
    await expect(dino).toContainText('Nut-free kitchen · Private room · Parking');
    await expect(dino).toContainText('$340 for 2.5 h');
    await expect(dino).toContainText('Free 1:00–3:30 pm');
    await expect(venues.result('Little Diggers Sandbox Studio')).toContainText(
      'Fits 15; you invited 16',
    );
  });

  test('updates results and the count when filters change', async ({ page }) => {
    const venues = new VenuesPage(page);
    await venues.openVenues();
    await expect(venues.results).toHaveCount(5);

    await venues.toggleFilter('Nut-free kitchen');

    await expect(venues.filterChip('Nut-free kitchen')).toHaveAttribute('aria-pressed', 'true');
    await expect(venues.results).toHaveCount(2);
    await expect(venues.subtitle).toHaveText('2 venues free on Sat 14 Nov near Leslieville');
  });

  test('sorts results and remembers the choice for the session', async ({ page }) => {
    const venues = new VenuesPage(page);
    await venues.openVenues();

    await venues.sort.selectOption({ label: 'Price: low to high' });
    await expect
      .poll(() => venues.resultNames())
      .toEqual([
        'Beaches Art Loft',
        'Little Diggers Sandbox Studio',
        'Dino Den Play Café',
        'Maple Climb Kids',
        'Junction Science Hub',
      ]);

    await venues.openVenues();
    await expect(venues.sort).toHaveValue('price');
  });

  test('explains an empty result and offers a relaxation that works', async ({ page }) => {
    const venues = new VenuesPage(page);
    await venues.openVenues();
    await venues.maxPrice.selectOption({ label: '$250' });
    await venues.toggleFilter('Nut-free kitchen');

    await expect(venues.noResults).toContainText('No venues under $250 with a nut-free kitchen');
    await venues.relax('Raise to $340');

    await expect(venues.results).toHaveCount(1);
    await expect(venues.maxPrice).toHaveValue('340');
  });

  test('keeps the filters and offers Try again when availability times out', async ({
    page,
    fakeApi,
  }) => {
    const venues = new VenuesPage(page);
    await venues.openVenues();
    fakeApi.respond('GET', '/api/venues/search', {
      status: 503,
      body: problem(503, 'We couldn’t check venue availability right now.'),
    });
    await venues.toggleFilter('Parking');

    await expect(venues.error).toBeVisible();
    await expect(venues.filterChip('Parking')).toHaveAttribute('aria-pressed', 'true');
    await expect(venues.date).toHaveValue('2026-11-14');
  });

  test('explains that Giddy covers the GTA only', async ({ page, fakeApi }) => {
    fakeApi.respond('GET', '/api/venues/search', {
      body: {
        area: 'Outside the GTA (K1A)',
        radiusKm: 10,
        outsideServiceArea: true,
        results: [],
        noResults: null,
      },
    });
    const venues = new VenuesPage(page);
    await venues.openVenues();

    await expect(venues.outsideArea).toContainText('Toronto, Durham, York, Peel and Halton');
  });
});

test.describe('comparing venues', () => {
  test('a bar counts picks, refuses a fourth and opens the comparison', async ({ page }) => {
    const venues = new VenuesPage(page);
    const compare = new CompareVenuesPage(page);
    await venues.openVenues();

    await venues.compare('Dino Den Play Café');
    await venues.compare('Maple Climb Kids');
    await expect(venues.compareBar).toContainText('2 venues selected');
    await venues.compare('Junction Science Hub');
    await venues.tryToCompare('Beaches Art Loft');

    await expect(venues.compareBar).toContainText('You can compare up to 3 venues');
    await expect(venues.compareBox('Beaches Art Loft')).not.toBeChecked();
    await venues.openComparison();

    await expect(compare.heading).toBeVisible();
    expect(await compare.columnHeaders()).toEqual([
      'Feature',
      '🦕 Dino Den Play Café',
      '🧗 Maple Climb Kids',
      '🔬 Junction Science Hub',
    ]);
  });

  test('marks the best value in each row in words and shows Giddy’s pick', async ({ page }) => {
    const compare = new CompareVenuesPage(page);
    await compare.openComparison(
      `?ids=${dinoDenId},b1000000-0000-4000-8000-000000000007,b1000000-0000-4000-8000-000000000009&date=2026-11-14&partyId=${dinoParty}`,
    );

    await expect(compare.pick).toContainText('Giddy’s pick: Dino Den Play Café');
    await expect(compare.pick).toContainText('Cheapest and closest.');
    await expect(compare.row('Price').getByRole('cell').first()).toContainText('$340 for 2.5 h');
    await expect(compare.row('Price').getByRole('cell').first()).toContainText('Best');
    await expect(compare.row('Fits').getByRole('cell').nth(2)).toContainText('Best');
  });

  test('explains how to pick venues when none are selected', async ({ page }) => {
    const compare = new CompareVenuesPage(page);
    await compare.openComparison('');

    await expect(compare.empty.getByRole('link', { name: 'Browse venues' })).toBeVisible();
  });
});

test.describe('a venue’s page', () => {
  test('shows details and slots with the earliest free one selected', async ({ page }) => {
    const venue = new VenueDetailPage(page);
    await venue.openVenue(dinoDenId, `?date=2026-11-14&partyId=${dinoParty}`);

    await expect(venue.heading('Dino Den Play Café')).toBeVisible();
    await expect(venue.gallery).toBeVisible();
    await expect(venue.reviews).toContainText('Rania H.');
    await expect(venue.slot('10:00 am')).toBeDisabled();
    await expect(venue.slot('10:00 am')).toHaveAccessibleName('10:00 am to 12:30 pm, booked');
    await expect(venue.slot('1:00 pm')).toHaveAttribute('aria-pressed', 'true');

    await venue.slot('4:00 pm').click();
    await expect(venue.slot('4:00 pm')).toHaveAttribute('aria-pressed', 'true');
    await expect(venue.slot('1:00 pm')).toHaveAttribute('aria-pressed', 'false');
  });

  test('saves the venue to favourites and announces it', async ({ page, fakeApi }) => {
    const venue = new VenueDetailPage(page);
    await venue.openVenue(dinoDenId);

    await venue.favourite.click();

    await expect(venue.favourite).toHaveAttribute('aria-pressed', 'true');
    expect([...fakeApi.venueStore.favourites]).toEqual([dinoDenId]);
  });

  test('a fully booked date offers the nearest free date, a similar venue and a waitlist', async ({
    page,
    fakeApi,
  }) => {
    const venue = new VenueDetailPage(page);
    await venue.openVenue(danforthId, `?date=2026-11-14&partyId=${dinoParty}`);

    await expect(venue.bookingCard).toContainText('Sat 14 Nov is fully booked');
    await expect(venue.bookingCard).toContainText('Sun 15 Nov, 10:00 am');
    await expect(venue.bookingCard).toContainText('Dino Den Play Café');
    await venue.tellMeIfASlotOpens();

    await expect(venue.bookingCard).toContainText('We’ll tell you if a slot opens');
    expect(fakeApi.venueStore.waitlist).toEqual([{ venueId: danforthId, date: '2026-11-14' }]);
  });
});

for (const width of [360, 1280]) {
  test(`venues, a venue and a comparison have no serious accessibility issues at ${width}px`, async ({
    page,
  }) => {
    const venues = new VenuesPage(page);
    const venue = new VenueDetailPage(page);
    const compare = new CompareVenuesPage(page);
    await venues.useWidth(width);

    await venues.openVenues();
    await expect(venues.results).toHaveCount(5);
    await venues.compare('Dino Den Play Café');
    expect(await venues.seriousAccessibilityViolations()).toEqual([]);
    expect(await venues.scrollsSideways()).toBe(false);

    await venue.openVenue(dinoDenId);
    await expect(venue.heading('Dino Den Play Café')).toBeVisible();
    expect(await venue.seriousAccessibilityViolations()).toEqual([]);
    expect(await venue.scrollsSideways()).toBe(false);

    await compare.openComparison(
      `?ids=${dinoDenId},b1000000-0000-4000-8000-000000000007&date=2026-11-14`,
    );
    await expect(compare.table).toBeVisible();
    expect(await compare.seriousAccessibilityViolations()).toEqual([]);
    expect(await compare.scrollsSideways()).toBe(false);
  });
}
