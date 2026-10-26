// Screen recordings for video 01, made with tools/video-record/record-clips.mjs against the
// running frontend. The backend is faked like the e2e suite (tools/video-record/giddy-fake-api.mjs).
import { installFakeApi } from '../../../../tools/video-record/giddy-fake-api.mjs';

async function open(demo, path, heading) {
  await demo.go(path, { ready: false });
  await demo.app().getByRole('heading', { level: 1, name: heading }).waitFor();
  await demo.pause(600);
}

export default [
  {
    name: 'shell-desktop',
    run: async (demo) => {
      await installFakeApi(demo.page);
      await open(demo, '/', /Amara/);
      demo.mark();
      await demo.pause(1800);
      const app = demo.app();
      await demo.moveTo(app.getByRole('navigation', { name: 'Primary', exact: true }).getByText('Explore'));
      await demo.pause(900);
      await demo.moveTo(app.getByRole('heading', { name: 'Zuri’s Dino Dig 7th' }));
      await demo.pause(1600);
      await demo.click(app.getByRole('button', { name: 'Dark theme' }));
      await demo.pause(2200);
      await demo.go('/party-that-floated-away', { ready: false });
      await app.getByRole('heading', { name: 'This page floated away' }).waitFor();
      await demo.pause(2200);
      await demo.click(app.getByRole('link', { name: 'Go to my home' }));
      await demo.pause(1500);
      await demo.click(app.getByRole('button', { name: 'Dark theme' }));
      await demo.pause(1200);
    },
  },
  {
    name: 'states-phone',
    phone: true,
    run: async (demo) => {
      const api = await installFakeApi(demo.page);
      api.partiesDelayMs = 2500;
      api.partiesFailure = 'GDY-7Q2K';
      await demo.go('/', { ready: false });
      demo.mark();
      const app = demo.app();
      await app.getByRole('alert').waitFor();
      await demo.pause(2500);
      api.partiesFailure = null;
      api.partiesDelayMs = 1200;
      await demo.click(app.getByRole('button', { name: 'Try again' }));
      await app.getByRole('heading', { name: 'Zuri’s Dino Dig 7th' }).waitFor();
      await demo.pause(1800);
      await demo.page.context().setOffline(true);
      await demo.pause(2500);
      await demo.page.context().setOffline(false);
      await demo.pause(1800);
      await demo.click(app.getByRole('button', { name: 'Dismiss' }));
      await demo.pause(1200);
    },
  },
];
