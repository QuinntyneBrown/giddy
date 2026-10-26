// Stills for video 10, made with tools/video-record/capture-shots.mjs against the e2e fake API.
export const fake = 'e2e';

const kofisDraft = '4b0c2d3e-5f60-4718-9a2b-3c4d5e6f7a80';
const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

export default [
  {
    name: 'desktop-empty',
    path: `/parties/${kofisDraft}/budget`,
    ready: async (page) => {
      await page.getByText('No costs yet').waitFor();
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'desktop-invalid-amount',
    path: `/parties/${dinoParty}/budget`,
    ready: async (page) => {
      await page.getByRole('table', { name: 'Party costs' }).waitFor();
      await page.locator('.page-header').getByRole('button', { name: 'Add a cost' }).click();
      const dialog = page.getByRole('dialog', { name: 'Add a cost' });
      await dialog.getByLabel('What is it?').fill('Balloons');
      await dialog.getByLabel('Amount').fill('35.555');
      await dialog.getByRole('button', { name: 'Add cost' }).click();
      await dialog.getByText('Enter an amount like 35 or 35.50').first().waitFor();
      await page.waitForTimeout(700);
    },
  },
];
