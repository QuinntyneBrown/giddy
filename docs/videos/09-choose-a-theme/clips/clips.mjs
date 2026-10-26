// Screen recordings for video 09, made with tools/video-record/record-clips.mjs against the
// running frontend and the e2e suite's fake API (tools/video-record/e2e-fake-api.mjs).
import { loadFakeApi } from '../../../../tools/video-record/e2e-fake-api.mjs';

async function fake(demo) {
  const FakeApi = await loadFakeApi();
  const api = new FakeApi();
  await api.install(demo.page);
  return api;
}

async function open(demo, path, heading) {
  await demo.go(path, { ready: false });
  await demo.app().getByRole('heading', { level: 1, name: heading }).waitFor();
  await demo.app().getByRole('list', { name: 'Themes' }).waitFor();
  await demo.pause(800);
}

export default [
  {
    name: 'browse-desktop',
    run: async (demo) => {
      await fake(demo);
      await open(demo, '/themes', 'Party themes');
      demo.mark();
      const filters = demo.app().getByRole('group', { name: 'Filter themes' });
      await demo.pause(3500);
      await demo.click(filters.getByRole('button', { name: 'Outdoor' }));
      await demo.pause(2500);
      await demo.click(filters.getByRole('button', { name: 'For Zuri (7)' }));
      await demo.pause(1500);
      await demo.click(filters.getByRole('button', { name: 'Ages 3–5' }));
      await demo.pause(2500);
      await demo.click(filters.getByRole('button', { name: 'Ages 3–5' }));
      await demo.click(filters.getByRole('button', { name: 'Outdoor' }));
      await demo.click(filters.getByRole('button', { name: 'For Zuri (7)' }));
      await demo.pause(2500);
    },
  },
  {
    name: 'choose-phone',
    phone: true,
    run: async (demo) => {
      await fake(demo);
      await open(demo, '/themes', 'Party themes');
      demo.mark();
      const app = demo.app();
      const space = app.getByRole('listitem').filter({ has: app.getByRole('heading', { name: 'Space Explorers', exact: true }) });
      await space.scrollIntoViewIfNeeded();
      await demo.pause(2000);
      await demo.click(space.getByRole('button', { name: 'Use this theme' }));
      await demo.pause(3500);
      await demo.click(app.getByRole('button', { name: 'Undo' }));
      await demo.pause(1500);
      const dino = app.getByRole('listitem').filter({ has: app.getByRole('heading', { name: 'Dino Dig', exact: true }) });
      await dino.scrollIntoViewIfNeeded();
      await demo.pause(2500);
    },
  },
];
