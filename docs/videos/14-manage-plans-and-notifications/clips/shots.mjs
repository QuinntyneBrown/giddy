// Stills for video 14, made with tools/video-record/capture-shots.mjs against the e2e fake API.
export const fake = 'e2e';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

/** The visitor chose cookies already, so the consent bar stays out of the shot. */
const cookiesChosen = (page) =>
  page.addInitScript(() =>
    localStorage.setItem(
      'giddy.cookie-choice',
      JSON.stringify({ choice: 'essential', savedAt: Date.now() }),
    ),
  );

/** The browser hasn't been asked about notifications yet. */
const pushUndecided = (page) =>
  page.addInitScript(() => {
    class FakeNotification {
      static permission = 'default';
      static async requestPermission() {
        return 'granted';
      }
    }
    Object.assign(window, { Notification: FakeNotification });
  });

export default [
  {
    name: 'desktop-notifications',
    path: '/notifications',
    prepare: (page) => cookiesChosen(page),
    ready: async (page) => {
      await page.getByRole('heading', { level: 1, name: 'Notifications' }).waitFor();
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'desktop-push-prompt',
    path: `/parties/${dinoParty}/invite`,
    prepare: async (page, api) => {
      await cookiesChosen(page);
      await pushUndecided(page);
      api.guestStore.notInvitedYet();
    },
    ready: async (page) => {
      await page.getByRole('button', { name: /^Send to / }).click();
      await page.getByText('Get a buzz when friends RSVP?').waitFor();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'phone-cookie-consent',
    phone: true,
    path: '/sign-in',
    prepare: (page, api) => {
      api.session = null;
    },
    ready: async (page) => {
      await page.getByRole('region', { name: 'A few cookies, no crumbs' }).waitFor();
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'desktop-delete-account',
    path: '/settings',
    prepare: (page) => cookiesChosen(page),
    ready: async (page) => {
      await page.getByRole('button', { name: 'Delete my account' }).click();
      const dialog = page.getByRole('dialog', {
        name: 'Delete your Giddy account?',
      });
      await dialog.getByText('1 booking isn’t cancelled').waitFor();
      await page.waitForTimeout(700);
    },
  },
];
