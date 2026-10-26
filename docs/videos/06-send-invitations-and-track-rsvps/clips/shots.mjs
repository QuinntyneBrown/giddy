// Stills for video 06, made with tools/video-record/capture-shots.mjs against the e2e fake API.
export const fake = 'e2e';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';
const settle = (page) => page.waitForTimeout(700);

export default [
  {
    name: 'desktop-guests',
    path: `/parties/${dinoParty}/guests`,
    ready: async (page) => {
      await page.getByRole('table', { name: 'Guest list' }).waitFor();
      await settle(page);
    },
  },
  {
    name: 'desktop-unverified',
    path: `/parties/${dinoParty}/invite`,
    prepare: async (page, api) => {
      api.guestStore.notInvitedYet();
      api.session = { ...api.session, emailVerified: false };
    },
    ready: async (page) => {
      await page.getByRole('button', { name: 'Send to 16 families' }).click();
      await page.getByText('Verify your email first').waitFor();
      await page.getByText('Verify your email first').scrollIntoViewIfNeeded();
      await settle(page);
    },
  },
  {
    name: 'phone-link-not-working',
    phone: true,
    path: '/rsvp/an-old-link',
    prepare: async (page, api) => {
      api.session = null;
    },
    ready: async (page) => {
      await page.getByRole('heading', { name: 'This link no longer works' }).waitFor();
      await settle(page);
    },
  },
  {
    name: 'desktop-bounced',
    path: `/parties/${dinoParty}`,
    prepare: async (page, api) => {
      // The first poll only takes the cursor, so add the bounce after it.
      setTimeout(() => api.guestStore.push({
        guestId: 'e1000000-0000-4000-8000-000000000001',
        kind: 'bounced',
        tone: 'danger',
        title: 'The invitation to the Chen family bounced',
        text: 'lily@example.com didn’t accept it. Check the address with Lily Chen.',
        action: { label: 'Fix email', kind: 'fix-email' },
      }), 2500);
    },
    ready: async (page) => {
      await page.getByText('The invitation to the Chen family bounced').waitFor({ timeout: 10000 });
      await settle(page);
    },
  },
];
