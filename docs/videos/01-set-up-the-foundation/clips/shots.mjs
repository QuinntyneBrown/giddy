// Stills for video 01, made with tools/video-record/capture-shots.mjs against the fake API.
const h1 = (page) => page.getByRole('heading', { level: 1 }).waitFor();

export default [
  {
    name: 'phone-empty-home',
    phone: true,
    path: '/',
    prepare: async (page, api) => {
      api.parties = [];
    },
    ready: (page) => page.getByRole('heading', { name: 'Who’s the next birthday star?' }).waitFor(),
  },
  { name: 'phone-forbidden', phone: true, path: '/403', ready: h1 },
  { name: 'desktop-server-error', path: '/500?ref=GDY-5XR1', ready: h1 },
  { name: 'phone-offline', phone: true, path: '/offline', ready: h1 },
  {
    name: 'desktop-loading',
    path: '/',
    prepare: async (page, api) => {
      api.partiesDelayMs = 60000;
    },
    ready: (page) => page.locator('[aria-busy="true"]').waitFor(),
  },
];
