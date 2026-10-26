// Stills for video 15, made with tools/video-record/capture-shots.mjs against the e2e fake API.
export const fake = 'e2e';

const zurisSeventh = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';
const zurisSixth = '6d1e2f30-4152-4637-8849-5a6b7c8d9e01';

/** The visitor chose cookies already, so the consent bar stays out of the shot. */
const cookiesChosen = (page) =>
  page.addInitScript(() =>
    localStorage.setItem(
      'giddy.cookie-choice',
      JSON.stringify({ choice: 'essential', savedAt: Date.now() }),
    ),
  );

export default [
  {
    name: 'desktop-not-yet',
    path: `/parties/${zurisSeventh}/wrap-up`,
    prepare: (page) => cookiesChosen(page),
    ready: async (page) => {
      await page.getByRole('heading', { name: 'Wrap-up opens after the party' }).waitFor();
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'desktop-next-year',
    path: `/parties/${zurisSixth}/wrap-up`,
    prepare: (page) => cookiesChosen(page),
    ready: async (page) => {
      await page.getByRole('button', { name: 'Save as template' }).click();
      const saved = page.getByText('Plan saved for next time');
      await saved.waitFor();
      await saved.scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'desktop-from-template',
    path: `/parties/${zurisSixth}`,
    prepare: (page) => cookiesChosen(page),
    ready: async (page) => {
      await page.getByRole('button', { name: 'Reuse this plan' }).click();
      await page.getByText('Starting from Zuri’s 6th: Mermaid Splash').waitFor();
      await page.waitForTimeout(700);
    },
  },
];
