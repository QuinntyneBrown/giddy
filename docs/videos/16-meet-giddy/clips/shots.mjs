// Stills for video 16 (the marketing pitch), made with tools/video-record/capture-shots.mjs
// against the e2e fake API: three real phone screens, the chat's priced plan, venues and the run sheet.
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

export default [
  {
    name: 'phone-plan',
    phone: true,
    path: '/ask-giddy',
    prepare: (page) => cookiesChosen(page),
    ready: async (page) => {
      await page.getByRole('heading', { level: 1, name: 'Ask Giddy' }).waitFor();
      await page.getByRole('textbox', { name: 'Message Giddy' }).fill('Plan Zuri’s 7th, 15 kids, $800, Leslieville');
      await page.keyboard.press('Enter');
      const plan = page.getByRole('button', { name: 'Use this plan' });
      await plan.waitFor({ timeout: 15000 });
      await page
        .locator('.plan-card')
        .last()
        .evaluate((card) => window.scrollBy(0, card.getBoundingClientRect().top - 80));
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'phone-venues',
    phone: true,
    path: '/venues',
    prepare: (page) => cookiesChosen(page),
    ready: async (page) => {
      const list = page.getByRole('list', { name: 'Venues' });
      await list.waitFor();
      await list.evaluate((el) => window.scrollBy(0, el.getBoundingClientRect().top - 80));
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'phone-run-sheet',
    phone: true,
    path: `/parties/${dinoParty}/day`,
    prepare: (page) => cookiesChosen(page),
    ready: async (page) => {
      await page.getByRole('list', { name: 'Run sheet' }).waitFor();
      await page.waitForTimeout(700);
    },
  },
];
