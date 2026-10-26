import { dinoParty, kofisDraft } from './fixtures/seed-data';
import { expect, test } from './fixtures/test';
import { ChecklistPage } from './pages/checklist.page';
import { ConflictDialog } from './pages/conflict.dialog';
import { OfflinePage } from './pages/offline.page';
import { PartyDayPage } from './pages/party-day.page';
import { SyncBanner } from './pages/sync-banner.page';

/** 1:40 pm on the party day in Toronto. */
const duringTheShow = '2026-11-14T18:40:00Z';

test.describe('the run sheet', () => {
  test('lists timed steps with who looks after each and the key reminder', async ({ page }) => {
    const day = new PartyDayPage(page);
    await day.openPartyDay(dinoParty.id);

    await expect(day.sections.getByRole('link', { name: 'Party day' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(day.subtitle).toHaveText('Sat 14 Nov · 1:00–3:30 pm · 11 kids coming');
    await expect
      .poll(() => day.stepTitles())
      .toEqual([
        'Arrive and set up',
        'Pizza Nonna delivery',
        'Guests arrive',
        'Professor Fizz’s Volcano Lab',
        'Food and drinks',
        'Cake and Happy Birthday',
        'Loot bags',
        'Pick-up and goodbyes',
      ]);
    await expect(day.step('Arrive and set up')).toContainText('12:15 pm');
    await expect(day.step('Guests arrive')).toContainText('Bea');
    await expect(day.step('Food and drinks')).toContainText('dairy-free for Maya');
    await expect(day.current()).toHaveCount(0);
  });

  test('highlights the current step and moves on at each step’s time', async ({ page }) => {
    const day = new PartyDayPage(page);
    await day.setNow(duringTheShow);
    await day.openPartyDay(dinoParty.id);

    await expect(day.subtitle).toContainText('Today!');
    await expect(day.current()).toContainText('Professor Fizz’s Volcano Lab');
    await expect(day.current()).toContainText('Now');
    await expect(day.step('Guests arrive')).toContainText('Done');
    await expect(day.step('Food and drinks')).not.toContainText('Done');

    await page.clock.fastForward('36:00');

    await expect(day.current()).toContainText('Food and drinks');
    await expect(day.step('Professor Fizz’s Volcano Lab')).toContainText('Done');
  });

  test('quick calls open the dialler and the allergy check lists every child', async ({ page }) => {
    const day = new PartyDayPage(page);
    await day.openPartyDay(dinoParty.id);

    await expect(day.call('Bea')).toHaveAttribute('href', 'tel:4165550142');
    await expect(day.call('Pizza Nonna')).toHaveAttribute('href', 'tel:4165550110');
    await expect(day.quickCalls).toContainText('Dino Den Play Café host');
    await expect(day.allergyCheck.getByRole('listitem')).toHaveText([
      'Arjun · Peanut (EpiPen with parent)',
      'Hana · Gluten-free (celiac)',
      'Maya · Dairy-free',
    ]);
  });

  test('offers to draft a run sheet when there is none', async ({ page, fakeApi }) => {
    fakeApi.runSheetStore.steps.delete(dinoParty.id);
    const day = new PartyDayPage(page);
    await day.openPartyDay(dinoParty.id);

    await expect(day.emptyState).toContainText('No run sheet yet');
    await day.emptyState.getByRole('button', { name: 'Draft my run sheet' }).click();

    await expect(day.step('Pick-up and goodbyes')).toContainText('3:30 pm');
  });

  test('explains when there is nothing booked to draft from', async ({ page }) => {
    const day = new PartyDayPage(page);
    await day.openPartyDay(kofisDraft.id);

    await day.emptyState.getByRole('button', { name: 'Draft my run sheet' }).click();

    await expect(day.toasts).toContainText('Add bookings to the plan first');
  });

  test('shows a retry when the run sheet can’t load', async ({ page, fakeApi }) => {
    fakeApi.respond('GET', '/api/parties/:partyId/run-sheet', {
      status: 500,
      body: { status: 500, title: 'Something went wrong', referenceCode: 'GDY-R1' },
    });
    const day = new PartyDayPage(page);
    await day.openPartyDay(dinoParty.id);

    await expect(day.emptyState).toContainText('We couldn’t load the run sheet');
    await expect(day.emptyState).toContainText('GDY-R1');
  });
});

test.describe('offline', () => {
  test('the run sheet and checklist load from the device with an offline banner', async ({
    page,
  }) => {
    const day = new PartyDayPage(page);
    const checklist = new ChecklistPage(page);
    const banner = new SyncBanner(page);
    await checklist.openChecklist(dinoParty.id);
    await expect(checklist.progress).toBeVisible();
    await day.sections.getByRole('link', { name: 'Party day' }).click();
    await expect(day.step('Guests arrive')).toBeVisible();

    await day.goOffline();
    await page.getByRole('link', { name: 'Home' }).first().click();
    await new OfflinePage(page).openRunSheet.click();

    await expect(banner.offline).toContainText('You can keep ticking off tasks');
    await expect(day.step('Guests arrive')).toBeVisible();
    await expect(day.savedNote).toBeVisible();
    await expect(day.call('Bea')).toBeVisible();
    await day.sections.getByRole('link', { name: 'Checklist' }).click();
    await expect(checklist.task('Order the cake')).toBeVisible();
  });

  test('ticks made offline sync when the connection returns', async ({ page, fakeApi }) => {
    const checklist = new ChecklistPage(page);
    const banner = new SyncBanner(page);
    await checklist.openChecklist(dinoParty.id);
    await expect(checklist.progress).toBeVisible();

    await checklist.goOffline();
    await checklist.checkbox('Order the cake').check();
    await expect(checklist.group('Done')).toContainText('Order the cake');
    expect(fakeApi.checklistStore.find(dinoParty.id, 'Order the cake')!.done).toBe(false);
    await checklist.goOnline();

    await expect(banner.backOnline).toContainText('1 change synced: 1 checklist tick.');
    expect(fakeApi.checklistStore.find(dinoParty.id, 'Order the cake')!.done).toBe(true);
    expect(fakeApi.checklistStore.doneRequests.at(-1)!.ifMatch).not.toBeNull();
  });

  test('a co-planner’s change to the same task is shown to resolve', async ({ page, fakeApi }) => {
    const checklist = new ChecklistPage(page);
    const banner = new SyncBanner(page);
    await checklist.openChecklist(dinoParty.id);
    await expect(checklist.progress).toBeVisible();

    await checklist.goOffline();
    await checklist.checkbox('Order the cake').check();
    fakeApi.checklistStore.rename(dinoParty.id, 'Order the cake', 'Order the dino cake', 'Kemi');
    await checklist.goOnline();

    await expect(banner.conflict).toContainText('1 change couldn’t sync');
    await expect(banner.conflict).toContainText('Kemi changed this task while you were offline.');
    await banner.reviewChange.click();
    const dialog = new ConflictDialog(page);
    await expect(dialog.dialog).toContainText('Order the dino cake');
    await dialog.keepMine.click();

    await expect(banner.conflict).toHaveCount(0);
    await expect(checklist.group('Done')).toContainText('Order the dino cake');
    expect(fakeApi.checklistStore.find(dinoParty.id, 'Order the dino cake')!.done).toBe(true);
  });

  test('a page that isn’t saved explains what still works', async ({ page }) => {
    const day = new PartyDayPage(page);
    await day.openPartyDay(dinoParty.id);
    await expect(day.step('Guests arrive')).toBeVisible();

    await day.goOffline();
    await page.getByRole('link', { name: 'Venues' }).first().click();

    const offline = new OfflinePage(page);
    await expect(offline.heading).toBeVisible();
    await expect(offline.openRunSheet).toHaveAttribute('href', `/parties/${dinoParty.id}/day`);
    await offline.openRunSheet.click();
    await expect(day.step('Guests arrive')).toBeVisible();
  });
});

test.describe('party day accessibility', () => {
  for (const width of [360, 1280]) {
    test(`has no serious violations at ${width}px on the day and offline`, async ({ page }) => {
      const day = new PartyDayPage(page);
      await day.useWidth(width);
      await day.setNow(duringTheShow);
      await day.openPartyDay(dinoParty.id);
      await expect(day.current()).toBeVisible();

      expect(await day.seriousAccessibilityViolations()).toEqual([]);
      await day.goOffline();
      await page.getByRole('link', { name: 'Home' }).first().click();
      await expect(new OfflinePage(page).heading).toBeVisible();
      expect(await day.seriousAccessibilityViolations()).toEqual([]);
    });
  }
});
