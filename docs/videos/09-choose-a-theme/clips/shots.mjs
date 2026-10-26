// Stills for video 09, made with tools/video-record/capture-shots.mjs against the e2e fake API.
export const fake = 'e2e';

export default [
  {
    name: 'desktop-no-match',
    path: '/themes',
    prepare: async (page, api) => {
      api.themeStore.themes = api.themeStore.themes.filter((t) => !t.outdoor);
    },
    ready: async (page) => {
      await page.getByRole('list', { name: 'Themes' }).waitFor();
      await page.getByRole('button', { name: 'Outdoor' }).click();
      await page.getByText('No themes match these filters').waitFor();
      await page.waitForTimeout(700);
    },
  },
];
