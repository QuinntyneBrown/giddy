// Stills for video 04, made with tools/video-record/capture-shots.mjs against the e2e fake API.
export const fake = 'e2e';

const h1 = (name) => (page) => page.getByRole('heading', { level: 1, name }).waitFor();

export default [
  { name: 'phone-venues', phone: true, path: '/venues', ready: async (page) => page.getByRole('list', { name: 'Venues' }).waitFor() },
  {
    name: 'desktop-compare',
    path: '/venues/compare?ids=b1000000-0000-4000-8000-000000000001,b1000000-0000-4000-8000-000000000007,b1000000-0000-4000-8000-000000000009&date=2026-11-14',
    ready: (page) => page.getByRole('table').waitFor(),
  },
  {
    name: 'desktop-outside-gta',
    path: '/venues',
    prepare: async (page, api) => {
      api.respond('GET', '/api/venues/search', { body: { area: 'Outside the GTA (K1A)', radiusKm: 10, outsideServiceArea: true, results: [], noResults: null } });
    },
    ready: (page) => page.getByText('Giddy covers the GTA for now').waitFor(),
  },
  {
    name: 'desktop-timeout',
    path: '/venues',
    prepare: async (page, api) => {
      api.respond('GET', '/api/venues/search', { status: 503, body: { status: 503, title: 'We couldn’t check venue availability right now.' } });
    },
    ready: (page) => page.getByText('We couldn’t check availability').waitFor(),
  },
];
