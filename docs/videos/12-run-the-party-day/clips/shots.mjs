// Stills for video 12, made with tools/video-record/capture-shots.mjs against the e2e fake API.
export const fake = 'e2e';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

export default [
  {
    name: 'desktop-empty',
    path: `/parties/${dinoParty}/day`,
    prepare: async (page, api) => {
      api.runSheetStore.steps.delete(dinoParty);
    },
    ready: async (page) => {
      await page.getByText('No run sheet yet').waitFor();
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'desktop-offline-page',
    path: `/parties/${dinoParty}/day`,
    ready: async (page) => {
      await page.getByRole('list', { name: 'Run sheet' }).waitFor();
      await page.waitForTimeout(500);
      await page.context().setOffline(true);
      await page.getByRole('link', { name: 'Venues' }).first().click();
      await page.getByRole('heading', { name: 'No internet right now' }).waitFor();
      await page.waitForTimeout(700);
    },
  },
];
