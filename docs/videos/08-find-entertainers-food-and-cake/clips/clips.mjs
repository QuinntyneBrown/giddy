// Screen recordings for video 08, made with tools/video-record/record-clips.mjs against the
// running frontend and the e2e suite's fake API (tools/video-record/e2e-fake-api.mjs).
import { loadFakeApi } from '../../../../tools/video-record/e2e-fake-api.mjs';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

async function fake(demo) {
  const FakeApi = await loadFakeApi();
  const api = new FakeApi();
  await api.install(demo.page);
  return api;
}

async function open(demo, path, heading) {
  await demo.go(path, { ready: false });
  await demo.app().getByRole('heading', { level: 1, name: heading }).waitFor();
  await demo.pause(800);
}

export default [
  {
    name: 'entertainers-desktop',
    run: async (demo) => {
      await fake(demo);
      await open(demo, '/vendors', 'Fun & food');
      await demo.app().getByText(/entertainers free on/).waitFor();
      demo.mark();
      const app = demo.app();
      const filters = app.getByRole('group', { name: 'Filter vendors' });
      await demo.pause(3000);
      await demo.click(filters.getByRole('button', { name: 'Dino Dig theme' }));
      await demo.pause(2500);
      await demo.click(filters.getByRole('button', { name: 'Dino Dig theme' }));
      await demo.pause(1500);
      const rexy = app.getByRole('listitem').filter({ has: app.getByRole('heading', { name: 'Rexy the Dino Visit' }) });
      await demo.click(rexy.getByRole('button', { name: 'Request a quote' }));
      const dialog = app.getByRole('dialog');
      await dialog.waitFor();
      await demo.pause(4500);
      await demo.click(dialog.getByRole('button', { name: 'Send request' }));
      await dialog.getByRole('button', { name: 'Done' }).waitFor();
      await demo.pause(3500);
      await demo.click(dialog.getByRole('button', { name: 'Done' }));
      await demo.pause(3000);
    },
  },
  {
    name: 'food-phone',
    phone: true,
    run: async (demo) => {
      await fake(demo);
      await open(demo, '/vendors?category=food', 'Fun & food');
      await demo.app().getByText(/bakeries and caterers/).waitFor();
      demo.mark();
      const app = demo.app();
      await demo.pause(1500);
      await app.locator('.alert--warning').scrollIntoViewIfNeeded();
      await demo.pause(3500);
      await demo.click(app.getByRole('button', { name: 'Dino Dig theme' }));
      await demo.pause(1500);
      for (const name of ['Sweet Rex Bakery', 'Cake Corner', 'Popsicle Parade']) {
        await app.getByRole('heading', { name, exact: true }).scrollIntoViewIfNeeded();
        await demo.pause(2500);
      }
    },
  },
  {
    name: 'expiring-desktop',
    run: async (demo) => {
      const api = await fake(demo);
      let confirmed = false;
      api.partyStore.bookings[1].status = 'quoted';
      api.partyStore.bookings[1].quoteExpiresOn = '2026-10-27';
      api.respond('GET', '/api/parties/:partyId/booking-notices', () => ({
        body: confirmed
          ? []
          : [
              {
                kind: 'quote-expiring',
                tone: 'warning',
                title: 'Professor Fizz’s Volcano Lab’s quote expires in 2 days',
                text: 'Confirm by Tue 27 Oct to keep it, or find another entertainer.',
                dismissible: true,
                bookingId: null,
                venueId: 'c1000000-0000-4000-8000-000000000001',
                quoteId: 'q-fizz',
                category: 'Entertainer',
              },
            ],
      }));
      api.respond('POST', '/api/parties/:partyId/quotes/:quoteId/confirm', () => {
        confirmed = true;
        api.partyStore.bookings[1].status = 'confirmed';
        return { status: 204 };
      });
      await open(demo, `/parties/${dinoParty}`, 'Party overview');
      demo.mark();
      const app = demo.app();
      await demo.pause(4500);
      await demo.click(app.getByRole('button', { name: 'Confirm' }));
      await demo.pause(3500);
    },
  },
];
