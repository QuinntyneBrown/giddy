import { expect, test } from './fixtures/test';
import { problem } from './fixtures/fake-api';
import { DeletePartyDialog } from './pages/delete-party.dialog';
import { PartiesPage } from './pages/parties.page';
import { PartyOverviewPage } from './pages/party-overview.page';

const dinoId = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

test.describe('My parties', () => {
  test('groups parties into upcoming, drafts and past with counts', async ({ page }) => {
    const parties = new PartiesPage(page);
    await parties.openList();

    await expect(parties.subtitle).toHaveText('1 upcoming · 1 draft · 1 past');
    await expect(parties.upcoming).toContainText('Zuri’s Dino Dig 7th');
    await expect(parties.upcoming.getByRole('img', { name: 'Plan 27% ready' })).toBeVisible();
    await expect(parties.drafts).toContainText('Kofi’s 4th: Choo-Choo Express');
    await expect(parties.drafts).toContainText('Wed 3 Feb 2027 · in 101 days');
    await expect(parties.past).toContainText('Zuri’s 6th: Mermaid Splash');
    await expect(parties.partyLink(parties.drafts, 'Kofi’s 4th')).toHaveAttribute(
      'href',
      '/parties/4b0c2d3e-5f60-4718-9a2b-3c4d5e6f7a80',
    );
  });

  test('offers Plan a party when there are none', async ({ page, fakeApi }) => {
    fakeApi.partyStore.parties = [];
    const parties = new PartiesPage(page);
    await parties.openList();

    await expect(parties.empty.getByRole('link', { name: 'Plan a party' })).toHaveAttribute(
      'href',
      '/parties/new',
    );
  });

  test('keeps the page and offers Try again when the list fails', async ({ page, fakeApi }) => {
    fakeApi.respond('GET', '/api/parties', { status: 500, body: problem(500, 'Oops') });
    const parties = new PartiesPage(page);
    await parties.openList();

    await expect(parties.error).toBeVisible();
    await expect(parties.heading).toBeVisible();
    fakeApi.respond('GET', '/api/parties', () => ({ body: fakeApi.partyStore.parties }));
    await parties.tryAgain();
    await expect(parties.upcoming).toBeVisible();
  });
});

test.describe('Party overview', () => {
  test('shows the countdown, readiness, bookings, next tasks, guests, budget and planners', async ({
    page,
  }) => {
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoId);

    await expect(overview.heading).toBeVisible();
    await expect(overview.hero).toContainText('20');
    await expect(overview.readiness).toHaveAccessibleName('Plan 27% ready');
    await expect(overview.bookingRow('Venue')).toContainText('Dino Den Play Café');
    await expect(overview.bookingRow('Venue')).toContainText('Booked');
    await expect(overview.bookingRow('Venue')).toContainText('$340');
    await expect(overview.bookingRow('Entertainer')).toContainText('To book');
    await expect(overview.tasks()).toHaveCount(3);
    await expect(overview.tasks().first()).toContainText('Overdue · was due Tue 20 Oct');
    await expect(overview.guests).toContainText('Coming');
    await expect(overview.guests).toContainText('Peanut');
    await expect(overview.budget).toContainText('$778');
    await expect(overview.budget).toContainText('of $800 · $22 left');
    await expect(overview.planners).toContainText('Amara Okafor (you)');
    await expect(overview.planners).toContainText('Co-planner');
  });

  test('only the bookings section warns when booking status fails', async ({ page, fakeApi }) => {
    fakeApi.respond('GET', '/api/parties/:partyId/bookings', {
      status: 503,
      body: problem(503, 'Down'),
    });
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoId);

    await expect(overview.bookingsWarning()).toContainText('Booking details didn’t load');
    await expect(overview.checklist).toBeVisible();
    await expect(overview.budget).toBeVisible();
    fakeApi.respond('GET', '/api/parties/:partyId/bookings', () => ({
      body: fakeApi.partyStore.bookings,
    }));
    await overview.retryBookings();
    await expect(overview.bookingRow('Venue')).toBeVisible();
  });

  test('a new plan with nothing booked offers to find a venue', async ({ page }) => {
    const overview = new PartyOverviewPage(page);
    await overview.openParty('4b0c2d3e-5f60-4718-9a2b-3c4d5e6f7a80');

    await expect(
      overview.nothingBooked.getByRole('link', { name: 'Find a venue with Giddy' }),
    ).toBeVisible();
    await expect(
      overview.nothingBooked.getByRole('link', { name: 'Browse venues myself' }),
    ).toBeVisible();
  });

  test('a past party is read-only with links to wrap up and reuse it', async ({ page }) => {
    const overview = new PartyOverviewPage(page);
    await overview.openParty('6d1e2f30-4152-4637-8849-5a6b7c8d9e01');

    await expect(overview.lockedAlert).toContainText('The plan is now read-only');
    await expect(overview.lockedAlert.getByRole('link', { name: 'Send thank-yous' })).toBeVisible();
    await expect(overview.lockedAlert.getByRole('link', { name: 'Reuse this plan' })).toBeVisible();
    await expect(overview.main.getByRole('link', { name: 'Ask Giddy' })).toHaveCount(0);
  });

  test('co-planners see no delete control', async ({ page, fakeApi }) => {
    fakeApi.partyStore.parties[0].role = 'coPlanner';
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoId);
    await expect(overview.heading).toBeVisible();

    await expect(overview.deleteButton).toHaveCount(0);
  });
});

test.describe('Deleting a party', () => {
  test('explains what is lost, needs the exact name, then returns to My parties', async ({
    page,
    fakeApi,
  }) => {
    const overview = new PartyOverviewPage(page);
    const dialog = new DeletePartyDialog(page);
    await overview.openParty(dinoId);

    await overview.startDelete();
    await expect(dialog.dialog).toContainText(
      'guest list, RSVPs, the budget, the checklist and Giddy’s chat',
    );
    await expect(dialog.dialog).toContainText('Guests won’t be notified');
    await expect(dialog.dialog).toContainText('does not cancel bookings');
    await expect(dialog.cancel).toBeFocused();

    await dialog.continueButton.click();
    await expect(dialog.deleteButton).toBeDisabled();
    await dialog.typeName('Zuri 7');
    await dialog.deleteButton.click();
    await expect(dialog.error).toHaveText('Type the party name exactly: Zuri’s Dino Dig 7th');
    expect(fakeApi.partyStore.deleted).toEqual([]);

    await dialog.typeName('Zuri’s Dino Dig 7th');
    await dialog.deleteButton.click();

    await expect.poll(() => overview.path()).toBe('/parties');
    expect(fakeApi.partyStore.deleted).toEqual([dinoId]);
  });
});

for (const width of [360, 1280]) {
  test(`parties and overview have no serious accessibility issues at ${width}px`, async ({
    page,
  }) => {
    const parties = new PartiesPage(page);
    const overview = new PartyOverviewPage(page);
    const dialog = new DeletePartyDialog(page);
    await parties.useWidth(width);
    await parties.openList();
    await expect(parties.upcoming).toBeVisible();
    expect(await parties.seriousAccessibilityViolations()).toEqual([]);

    await overview.openParty(dinoId);
    await expect(overview.bookingRow('Venue')).toBeVisible();
    expect(await overview.seriousAccessibilityViolations()).toEqual([]);
    expect(await overview.scrollsSideways()).toBe(false);

    await overview.startDelete();
    await expect(dialog.dialog).toBeVisible();
    expect(await overview.seriousAccessibilityViolations()).toEqual([]);
  });
}

test('the overview links to the party’s guests and invitations', async ({ page }) => {
  const overview = new PartyOverviewPage(page);
  await overview.openParty('3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6');

  await expect(overview.sections.getByRole('link', { name: 'Overview' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(overview.sections.getByRole('link', { name: 'Guests' })).toHaveAttribute(
    'href',
    '/parties/3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6/guests',
  );
  await expect(overview.sections.getByRole('link', { name: 'Invites' })).toBeVisible();
});
