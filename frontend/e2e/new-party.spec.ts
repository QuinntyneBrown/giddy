import { expect, test } from './fixtures/test';
import { problem } from './fixtures/fake-api';
import { NewPartyPage } from './pages/new-party.page';
import { PlannerChatPage } from './pages/planner-chat.page';

test.beforeEach(async ({ page }) => {
  await new NewPartyPage(page).setNow('2026-10-25T20:00:00Z');
});

test('defaults the date to the child’s next birthday and the area to the family postal code', async ({
  page,
}) => {
  const form = new NewPartyPage(page);
  await form.openNew();

  await expect(form.child('Zuri')).toBeChecked();
  await expect(form.date).toHaveValue('2026-11-14');
  expect(await form.help(form.date)).toContain('Sat 14 Nov 2026 · Zuri’s actual birthday');
  await expect(form.near).toHaveValue('M4M 1H1');
  expect(await form.help(form.near)).toContain('Leslieville · we’ll look within 10 km');

  await form.child('Kofi').check();
  await expect(form.date).toHaveValue('2027-02-03');
});

test('can start from a child picked elsewhere', async ({ page }) => {
  const form = new NewPartyPage(page);
  await form.openNew('?child=11111111-2222-4333-8444-000000000002');

  await expect(form.child('Kofi')).toBeChecked();
});

test('shows the typical budget for the number of kids', async ({ page }) => {
  const form = new NewPartyPage(page);
  await form.openNew();

  await form.guests.fill('16');
  await expect
    .poll(() => form.help(form.budget))
    .toContain('Typical for 16 kids in Toronto: $600–$1,100');
  await form.guests.fill('30');
  await expect
    .poll(() => form.help(form.budget))
    .toContain('Typical for 30 kids in Toronto: $900–$1,600');
});

test('creates the party and continues in Ask Giddy with the details', async ({ page, fakeApi }) => {
  const form = new NewPartyPage(page);
  const chat = new PlannerChatPage(page);
  await form.openNew();
  await form.guests.fill('16');
  await form.budget.fill('800');

  await form.submit();

  await expect(chat.heading).toBeVisible();
  expect(form.path()).toBe('/ask-giddy');
  expect(fakeApi.partyStore.created).toEqual([
    {
      childId: '11111111-2222-4333-8444-000000000001',
      childName: null,
      turningAge: null,
      date: '2026-11-14',
      guests: 16,
      timeOfDay: 'afternoon',
      budget: 800,
      postalCode: 'M4M 1H1',
    },
  ]);
});

test('asks for a name and age for someone else', async ({ page, fakeApi }) => {
  const form = new NewPartyPage(page);
  await form.openNew();
  await form.child('Someone else').check();
  await form.childName.fill('Maya');
  await form.turningAge.fill('5');
  await form.date.fill('2026-12-05');
  await form.guests.fill('10');
  await form.budget.fill('450');
  await form.timeOfDay('Morning').check();

  await form.submit();

  await expect.poll(() => fakeApi.partyStore.created.length).toBe(1);
  expect(fakeApi.partyStore.created[0]).toMatchObject({
    childId: null,
    childName: 'Maya',
    turningAge: 5,
    timeOfDay: 'morning',
  });
});

test('explains each fix in a focused summary and inline, and creates nothing', async ({
  page,
  fakeApi,
}) => {
  const form = new NewPartyPage(page);
  await form.openNew();
  await form.date.fill('2026-10-24');
  await form.guests.fill('0');

  await form.submit();

  await expect(form.errorSummary).toBeFocused();
  await expect(form.summaryLink('Pick a date from tomorrow onwards')).toHaveAttribute('href', /#/);
  await expect(form.summaryLink('Enter how many kids, from 1 to 60')).toBeVisible();
  await expect(form.date).toHaveAttribute('aria-invalid', 'true');
  expect(await form.help(form.guests)).toContain('Enter how many kids, from 1 to 60');
  expect(fakeApi.partyStore.created).toEqual([]);

  await form.summaryLink('Enter how many kids, from 1 to 60').click();
  await expect(form.guests).toBeFocused();
});

test('keeps everything typed when saving fails and saves on the next try', async ({
  page,
  fakeApi,
}) => {
  fakeApi.respond('POST', '/api/parties', { status: 503, body: problem(503, 'Unavailable') });
  const form = new NewPartyPage(page);
  await form.openNew();
  await form.guests.fill('18');
  await form.budget.fill('900');

  await form.submit();

  await expect(form.submitError).toBeVisible();
  await expect(form.guests).toHaveValue('18');
  await expect(form.budget).toHaveValue('900');
  fakeApi.respond('POST', '/api/parties', () => ({
    status: 201,
    body: fakeApi.partyStore.parties[1],
  }));
  await form.submit();
  await expect(page.getByRole('heading', { level: 1, name: 'Ask Giddy' })).toBeVisible();
});

for (const width of [360, 1280]) {
  test(`new party has no serious accessibility issues at ${width}px`, async ({ page }) => {
    const form = new NewPartyPage(page);
    await form.useWidth(width);
    await form.openNew();
    await expect(form.date).toHaveValue('2026-11-14');
    expect(await form.seriousAccessibilityViolations()).toEqual([]);

    await form.guests.fill('0');
    await form.submit();
    await expect(form.errorSummary).toBeVisible();
    expect(await form.seriousAccessibilityViolations()).toEqual([]);
    expect(await form.scrollsSideways()).toBe(false);
  });
}
