// Stills for video 03, made with tools/video-record/capture-shots.mjs against the fake API.
const h1 = (name) => (page) => page.getByRole('heading', { level: 1, name }).waitFor();

export default [
  {
    name: 'phone-invalid',
    phone: true,
    path: '/parties/new',
    ready: async (page) => {
      await h1('Plan a new party')(page);
      await page.getByLabel('Party date').fill('2026-10-20');
      await page.getByLabel('How many kids?').fill('0');
      await page.getByRole('button', { name: 'Plan it with Giddy' }).click();
      await page.getByText('Let’s fix a couple of things').waitFor();
    },
  },
  { name: 'desktop-home', path: '/', ready: h1(/Amara/) },
  { name: 'phone-parties', phone: true, path: '/parties', ready: h1('My parties') },
  { name: 'desktop-draft', path: '/parties/kofi-draft', ready: (page) => page.getByText('Nothing booked yet').waitFor() },
];
