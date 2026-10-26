// Stills for video 07, made with tools/video-record/capture-shots.mjs against the e2e fake API.
export const fake = 'e2e';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';
const settle = (page) => page.waitForTimeout(700);

export default [
  {
    name: 'desktop-empty',
    path: `/parties/${dinoParty}/guests`,
    prepare: async (page, api) => api.guestStore.empty(),
    ready: async (page) => {
      await page.getByRole('button', { name: 'Import a class list' }).waitFor();
      await settle(page);
    },
  },
  {
    name: 'desktop-reuse',
    path: `/parties/${dinoParty}/guests`,
    ready: async (page) => {
      await page.getByRole('button', { name: 'Import', exact: true }).click();
      await page.getByRole('radio', { name: /^Zuri’s 6th/ }).check();
      await settle(page);
    },
  },
  {
    name: 'desktop-add-invalid',
    path: `/parties/${dinoParty}/guests`,
    ready: async (page) => {
      await page.getByRole('button', { name: 'Add guest' }).click();
      const dialog = page.getByRole('dialog', { name: 'Add a guest' });
      await dialog.getByRole('textbox', { name: 'Child’s name' }).fill('Samira Haddad');
      await dialog.getByRole('textbox', { name: 'Parent’s name' }).fill('Rania Haddad');
      await dialog.getByRole('textbox', { name: 'Parent’s email' }).fill('rania');
      await dialog.getByRole('textbox', { name: /^Parent’s mobile/ }).fill('212-555-0131');
      await dialog.getByRole('button', { name: 'Add and invite' }).click();
      await dialog.locator('giddy-error-summary').waitFor();
      await settle(page);
    },
  },
];
