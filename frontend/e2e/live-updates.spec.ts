import { expect, test } from './fixtures/test';
import { GuestsPage } from './pages/guests.page';
import { HomePage } from './pages/home.page';
import { LiveToasts } from './pages/live-toasts.page';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

test.describe('live RSVP updates for the host', () => {
  test('a reply shows a toast within five seconds on any page', async ({ page, fakeApi }) => {
    const home = new HomePage(page);
    const live = new LiveToasts(page);
    await home.open('/');
    await expect(home.pageHeadings.first()).toBeVisible();

    fakeApi.guestStore.push({
      guestId: 'e1000000-0000-4000-8000-000000000007',
      kind: 'replied',
      tone: 'success',
      title: 'Aisha is coming!',
      text: 'Hodan Mohamed replied. 12 coming so far.',
      action: { label: 'View guests', kind: 'view-guests' },
    });

    const toast = live.toast('Aisha is coming!');
    await expect(toast).toBeVisible({ timeout: 5000 });
    await expect(toast).toContainText('Hodan Mohamed replied. 12 coming so far.');
    await expect(toast.getByRole('link', { name: 'View guests' })).toHaveAttribute(
      'href',
      `/parties/${dinoParty}/guests`,
    );
  });

  test('a new allergy is a warning that offers to share the list with the venue', async ({
    page,
    fakeApi,
  }) => {
    const home = new HomePage(page);
    const live = new LiveToasts(page);
    await home.open('/');
    await expect(home.pageHeadings.first()).toBeVisible();

    fakeApi.guestStore.push({
      guestId: 'e1000000-0000-4000-8000-000000000002',
      kind: 'allergy',
      tone: 'warning',
      title: 'New allergy: peanut',
      text: 'Priya Patel says Arjun has a peanut allergy. Let Dino Den Play Café know.',
      action: { label: 'Share with Dino Den Play Café', kind: 'share-allergies' },
    });

    await expect(live.toast('New allergy: peanut')).toBeVisible({ timeout: 5000 });
    await live.act('New allergy: peanut', 'Share with Dino Den Play Café');
    await expect(live.toast('Allergy list sent to Dino Den Play Café')).toBeVisible();
    expect(fakeApi.guestStore.allergyListShares).toBe(1);
  });

  test('a bounced invitation stays until dismissed and offers to fix the email', async ({
    page,
    fakeApi,
  }) => {
    const home = new HomePage(page);
    const live = new LiveToasts(page);
    await home.open('/');
    await expect(home.pageHeadings.first()).toBeVisible();

    fakeApi.guestStore.push({
      guestId: 'e1000000-0000-4000-8000-000000000001',
      kind: 'bounced',
      tone: 'danger',
      title: 'The invitation to the Chen family bounced',
      text: 'lily@example.com didn’t accept it. Check the address with Lily Chen.',
      action: { label: 'Fix email', kind: 'fix-email' },
    });

    const bounced = live.toast('The invitation to the Chen family bounced');
    await expect(bounced).toBeVisible({ timeout: 5000 });
    await expect(bounced.getByRole('link', { name: 'Fix email' })).toBeVisible();
    await page.waitForTimeout(7000);
    await expect(bounced).toBeVisible();
    await bounced.getByRole('button', { name: 'Dismiss' }).click();
    await expect(bounced).toHaveCount(0);
  });

  test('the guest list updates when a family replies', async ({ page, fakeApi }) => {
    const guests = new GuestsPage(page);
    await guests.openGuests(dinoParty);
    await expect(guests.row('Aisha Mohamed')).toContainText('Waiting');

    const aisha = fakeApi.guestStore.guests.find((g) => g.childName === 'Aisha Mohamed')!;
    aisha.rsvp = 'coming';
    fakeApi.guestStore.push({
      guestId: aisha.id,
      kind: 'replied',
      tone: 'success',
      title: 'Aisha is coming!',
      text: 'Hodan Mohamed replied. 12 coming so far.',
      action: { label: 'View guests', kind: 'view-guests' },
    });

    await expect(guests.row('Aisha Mohamed')).toContainText('Coming', { timeout: 5000 });
    await expect(guests.subtitle).toHaveText('16 invited · 12 coming · 2 waiting · 2 can’t come');
  });
});
