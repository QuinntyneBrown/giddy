// Screen recordings for video 13, made with tools/video-record/record-clips.mjs against the
// running frontend and the e2e suite's fake API (tools/video-record/e2e-fake-api.mjs).
import { loadFakeApi } from '../../../../tools/video-record/e2e-fake-api.mjs';

async function fake(demo) {
  const FakeApi = await loadFakeApi();
  const api = new FakeApi();
  await api.install(demo.page);
  return api;
}

export default [
  {
    name: 'sign-up-desktop',
    run: async (demo) => {
      const api = await fake(demo);
      api.session = null;
      api.partyStore.family.children = [];
      await demo.go('/sign-up', { ready: false });
      const app = demo.app();
      await app.getByRole('heading', { level: 1, name: 'Let’s plan something amazing' }).waitFor();
      await demo.pause(600);
      demo.mark();
      await demo.pause(1500);
      await demo.type(app.getByLabel('First name'), 'Rania');
      await demo.type(app.getByLabel('Email', { exact: true }), 'rania@example.com');
      await demo.type(app.getByLabel('Password'), 'dino-dig-2026');
      await demo.type(app.getByLabel('Postal code'), 'M4M 1H1');
      await demo.pause(800);
      await demo.click(app.getByRole('button', { name: 'Create my account' }));
      await app.getByText('One quick thing: check your email').waitFor();
      await demo.pause(3500);
      await demo.go('/verify-email?token=good-token', { ready: false });
      await app.getByText('You’re in, Rania!').waitFor();
      await demo.pause(2500);
      await demo.click(app.getByRole('link', { name: 'Set up my family' }));
      await app.getByRole('heading', { name: 'Who are we celebrating?' }).waitFor();
      await demo.pause(1500);
      await demo.click(app.locator('main').getByRole('button', { name: 'Add a child' }));
      const dialog = app.getByRole('dialog', { name: 'Add a child' });
      await demo.type(dialog.getByLabel('First name'), 'Zuri');
      await dialog.getByLabel('Birthday').fill('2019-11-14');
      await demo.pause(1200);
      await demo.click(dialog.getByRole('checkbox', { name: 'Dinosaurs' }));
      await demo.click(dialog.getByRole('checkbox', { name: 'Science' }));
      await demo.pause(800);
      await demo.click(dialog.getByRole('button', { name: 'Add Zuri' }));
      await demo.pause(2500);
      await demo.click(app.getByRole('link', { name: 'Go to my home' }));
      await demo.pause(2500);
    },
  },
  {
    name: 'sign-in-phone',
    phone: true,
    run: async (demo) => {
      const api = await fake(demo);
      api.session = null;
      await demo.go('/parties', { ready: false });
      const app = demo.app();
      await app.getByRole('heading', { level: 1, name: 'Welcome back!' }).waitFor();
      await demo.pause(600);
      demo.mark();
      await demo.pause(1500);
      await demo.type(app.getByLabel('Email', { exact: true }), 'amara.okafor@example.com');
      await demo.type(app.getByLabel('Password', { exact: true }), 'not-my-password-1');
      await demo.click(app.locator('main').getByRole('button', { name: 'Sign in' }));
      await app.getByText('That email and password don’t match').waitFor();
      await demo.pause(3500);
      await demo.type(app.getByLabel('Password', { exact: true }), 'dino-dig-2026');
      await demo.click(app.getByRole('checkbox', { name: 'Keep me signed in' }));
      await demo.click(app.locator('main').getByRole('button', { name: 'Sign in' }));
      await app.getByRole('heading', { level: 1, name: 'My parties' }).waitFor();
      await demo.pause(3000);
    },
  },
];
