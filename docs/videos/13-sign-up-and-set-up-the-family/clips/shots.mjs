// Stills for video 13, made with tools/video-record/capture-shots.mjs against the e2e fake API.
export const fake = 'e2e';

export default [
  {
    name: 'desktop-family',
    path: '/family',
    ready: async (page) => {
      await page.getByRole('region', { name: 'Zuri', exact: true }).waitFor();
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'desktop-still-there',
    path: '/settings',
    prepare: async (page, api) => {
      api.respond('DELETE', '/api/memories/:memoryId', { status: 401, body: { status: 401, title: 'Sign in to continue.' } });
    },
    ready: async (page) => {
      await page.getByRole('region', { name: 'What Giddy remembers' }).waitFor();
      await page.getByRole('button', { name: /^Forget: / }).first().click();
      await page.getByRole('dialog', { name: /^Still there/ }).waitFor();
      await page.waitForTimeout(700);
    },
  },
];
