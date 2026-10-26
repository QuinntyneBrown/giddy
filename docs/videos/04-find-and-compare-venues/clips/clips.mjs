// Screen recordings for video 04, made with tools/video-record/record-clips.mjs against the
// running frontend and the e2e suite's fake API (tools/video-record/e2e-fake-api.mjs).
import { loadFakeApi } from '../../../../tools/video-record/e2e-fake-api.mjs';

const dinoDen = 'b1000000-0000-4000-8000-000000000001';
const danforth = 'b1000000-0000-4000-8000-000000000003';
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
    name: 'search-desktop',
    run: async (demo) => {
      await fake(demo);
      await open(demo, '/venues', 'Venues');
      demo.mark();
      const app = demo.app();
      await demo.pause(3000);
      await demo.click(app.getByRole('button', { name: 'Nut-free kitchen', exact: true }));
      await demo.pause(2500);
      await demo.click(app.getByRole('button', { name: 'Nut-free kitchen', exact: true }));
      await demo.pause(1500);
      await app.getByLabel('Sort', { exact: true }).selectOption('price');
      await demo.pause(2500);
      for (const name of ['Dino Den Play Café', 'Maple Climb Kids', 'Junction Science Hub']) {
        await demo.click(app.getByRole('checkbox', { name: `Compare ${name}` }));
        await demo.pause(700);
      }
      await demo.pause(1500);
      await demo.click(app.getByRole('link', { name: 'Compare', exact: true }));
      await app.getByRole('heading', { level: 1, name: 'Compare venues' }).waitFor();
      await demo.pause(4000);
    },
  },
  {
    name: 'no-results-desktop',
    run: async (demo) => {
      await fake(demo);
      await open(demo, '/venues', 'Venues');
      demo.mark();
      const app = demo.app();
      await demo.pause(1500);
      await app.getByLabel('Max price', { exact: true }).selectOption('250');
      await demo.pause(1000);
      await demo.click(app.getByRole('button', { name: 'Nut-free kitchen', exact: true }));
      await demo.pause(3000);
      await demo.click(app.getByRole('button', { name: 'Raise to $340' }));
      await demo.pause(3000);
    },
  },
  {
    name: 'venue-phone',
    phone: true,
    run: async (demo) => {
      await fake(demo);
      await open(demo, `/venues/${dinoDen}?date=2026-11-14&partyId=${dinoParty}`, 'Dino Den Play Café');
      demo.mark();
      const app = demo.app();
      await demo.pause(1500);
      await demo.click(app.getByRole('button', { name: 'Save to favourites' }));
      await demo.pause(1200);
      await app.getByRole('complementary').scrollIntoViewIfNeeded();
      await demo.pause(1200);
      await demo.click(app.getByRole('button', { name: /^4:00 pm/ }));
      await demo.pause(2000);
      await open(demo, `/venues/${danforth}?date=2026-11-14&partyId=${dinoParty}`, 'Danforth Party Room');
      await app.getByRole('complementary').scrollIntoViewIfNeeded();
      await demo.pause(2000);
      await demo.click(app.getByRole('button', { name: 'Tell me if a slot opens' }));
      await demo.pause(2500);
    },
  },
];
