// Screen recordings for video 14, made with tools/video-record/record-clips.mjs against the
// running frontend and the e2e suite's fake API (tools/video-record/e2e-fake-api.mjs).
import { loadFakeApi } from '../../../../tools/video-record/e2e-fake-api.mjs';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

async function fake(demo) {
  const FakeApi = await loadFakeApi();
  const api = new FakeApi();
  await api.install(demo.page);
  await demo.page.addInitScript(() =>
    localStorage.setItem(
      'giddy.cookie-choice',
      JSON.stringify({ choice: 'essential', savedAt: Date.now() }),
    ),
  );
  return api;
}

export default [
  {
    name: 'share-desktop',
    run: async (demo) => {
      await fake(demo);
      await demo.go(`/parties/${dinoParty}`, { ready: false });
      const app = demo.app();
      await app.getByRole('heading', { level: 1 }).waitFor();
      await demo.pause(600);
      demo.mark();
      await demo.pause(1500);
      await demo.click(app.locator('.page-header').getByRole('button', { name: 'Share' }));
      const dialog = app.getByRole('dialog', { name: /^Share .+ party plan$/ });
      await dialog.waitFor();
      await demo.pause(1200);
      await demo.type(dialog.getByLabel('Email'), 'kwame.okafor@example.com');
      await demo.click(dialog.getByRole('button', { name: 'Send invite' }));
      await dialog.getByText('Invitation sent to kwame.okafor@example.com').waitFor();
      await demo.pause(2200);
      await demo.type(dialog.getByLabel('Email'), 'ngozi.okafor@example.com');
      await demo.click(dialog.getByRole('radio', { name: /^View only/ }));
      await demo.click(dialog.getByRole('button', { name: 'Send invite' }));
      await dialog.getByText('Invitation sent to ngozi.okafor@example.com').waitFor();
      await demo.pause(2200);
      await demo.click(dialog.getByRole('button', { name: 'Copy link' }));
      await dialog.getByLabel('View-only link').waitFor();
      await demo.pause(3500);
    },
  },
  {
    name: 'settings-desktop',
    run: async (demo) => {
      await fake(demo);
      await demo.go('/settings', { ready: false });
      const app = demo.app();
      await app.getByRole('table', { name: 'Notification channels' }).waitFor();
      await demo.pause(600);
      demo.mark();
      await demo.pause(1500);
      const mobile = app.getByLabel('Mobile', { exact: true });
      await mobile.fill('');
      await demo.type(mobile, '647-555-0199');
      await demo.pause(600);
      await demo.click(app.getByRole('checkbox', { name: 'Giddy’s reminders by email' }));
      await demo.pause(800);
      await demo.click(app.getByRole('button', { name: 'Save changes' }));
      await app.getByText('Settings saved').waitFor();
      await demo.pause(2500);
      await demo.click(app.getByRole('switch', { name: /Quiet hours/ }));
      await demo.pause(2500);
      await demo.click(app.getByRole('button', { name: 'Download my data' }));
      await app.getByText('We’re getting your data ready').waitFor();
      await demo.pause(3000);
    },
  },
];
