// Stills for video 08, made with tools/video-record/capture-shots.mjs against the e2e fake API.
export const fake = 'e2e';

const settle = (page) => page.waitForTimeout(700);

export default [
  {
    name: 'desktop-no-results',
    path: '/vendors?category=activities',
    prepare: async (page, api) => {
      api.vendorStore.vendors.find((v) => v.name === 'Paint Pals Face Painting').price = 250;
    },
    ready: async (page) => {
      await page.getByRole('button', { name: 'Under $200' }).click();
      await page.getByText('No activities under $200').waitFor();
      await settle(page);
    },
  },
  {
    name: 'desktop-start-invalid',
    path: '/vendors',
    ready: async (page) => {
      const rexy = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Rexy the Dino Visit' }) });
      await rexy.getByRole('button', { name: 'Request a quote' }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Start time').fill('16:00');
      await dialog.getByRole('button', { name: 'Send request' }).click();
      await dialog.getByText('Choose a start time between').waitFor();
      await settle(page);
    },
  },
];
