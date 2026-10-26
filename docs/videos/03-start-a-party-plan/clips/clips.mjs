// Screen recordings for video 03, made with tools/video-record/record-clips.mjs against the
// running frontend. The backend is faked like the e2e suite (tools/video-record/giddy-fake-api.mjs).
import { installFakeApi } from '../../../../tools/video-record/giddy-fake-api.mjs';

async function open(demo, path, heading) {
  await demo.go(path, { ready: false });
  await demo.app().getByRole('heading', { level: 1, name: heading }).waitFor();
  await demo.pause(600);
}

export default [
  {
    name: 'new-party-desktop',
    run: async (demo) => {
      await installFakeApi(demo.page);
      await open(demo, '/parties/new', 'Plan a new party');
      demo.mark();
      const app = demo.app();
      await demo.pause(2000);
      await demo.moveTo(app.getByLabel('Party date'));
      await demo.pause(1500);
      await demo.type(app.getByLabel('How many kids?'), '16');
      await demo.pause(1500);
      await demo.type(app.getByLabel('Budget'), '800');
      await demo.pause(1200);
      await demo.click(app.getByRole('radio', { name: /^Afternoon/ }));
      await demo.pause(800);
      await demo.click(app.getByRole('button', { name: 'Plan it with Giddy' }));
      await app.getByRole('heading', { level: 1, name: 'Ask Giddy' }).waitFor();
      await demo.pause(2500);
    },
  },
  {
    name: 'overview-desktop',
    run: async (demo) => {
      await installFakeApi(demo.page);
      await open(demo, '/', /Amara/);
      demo.mark();
      const app = demo.app();
      await demo.pause(4000);
      await demo.click(app.getByRole('link', { name: 'Open plan' }));
      await app.getByRole('heading', { level: 1, name: 'Party overview' }).waitFor();
      await demo.pause(5000);
      await demo.moveTo(app.getByRole('img', { name: 'Plan 27% ready' }));
      await demo.pause(4000);
      await app.getByRole('region', { name: 'Booked & to book' }).scrollIntoViewIfNeeded();
      await demo.pause(4000);
      await app.getByRole('region', { name: 'Next on the checklist' }).scrollIntoViewIfNeeded();
      await demo.pause(4000);
      await app.getByRole('region', { name: 'Planning together' }).scrollIntoViewIfNeeded();
      await demo.pause(3000);
    },
  },
  {
    name: 'delete-desktop',
    run: async (demo) => {
      await installFakeApi(demo.page);
      await open(demo, '/parties/3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6', 'Party overview');
      const app = demo.app();
      await app.getByRole('button', { name: 'Delete this party' }).scrollIntoViewIfNeeded();
      demo.mark();
      await demo.pause(1500);
      await demo.click(app.getByRole('button', { name: 'Delete this party' }));
      await demo.pause(5000);
      await demo.click(app.getByRole('dialog').getByRole('button', { name: 'Continue' }));
      await demo.pause(1000);
      await demo.type(app.getByRole('dialog').getByRole('textbox'), 'Zuri 7');
      await demo.click(app.getByRole('dialog').getByRole('button', { name: 'Delete party' }));
      await demo.pause(3500);
      await app.getByRole('dialog').getByRole('textbox').fill('');
      await demo.type(app.getByRole('dialog').getByRole('textbox'), 'Zuri’s Dino Dig 7th');
      await demo.click(app.getByRole('dialog').getByRole('button', { name: 'Delete party' }));
      await app.getByRole('heading', { level: 1, name: 'My parties' }).waitFor();
      await demo.pause(3000);
    },
  },
  {
    name: 'parties-phone',
    phone: true,
    run: async (demo) => {
      await installFakeApi(demo.page);
      await open(demo, '/parties', 'My parties');
      demo.mark();
      const app = demo.app();
      await demo.pause(2000);
      await app.getByRole('region', { name: 'Past parties' }).scrollIntoViewIfNeeded();
      await demo.pause(1200);
      await demo.click(app.getByRole('link', { name: /Mermaid Splash/ }));
      await app.getByText('This party has happened!').waitFor();
      await demo.pause(3500);
    },
  },
];
