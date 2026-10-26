// Screen recordings for video 11, made with tools/video-record/record-clips.mjs against the
// running frontend and the e2e suite's fake API (tools/video-record/e2e-fake-api.mjs).
import { loadFakeApi } from '../../../../tools/video-record/e2e-fake-api.mjs';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

async function fake(demo) {
  const FakeApi = await loadFakeApi();
  const api = new FakeApi();
  await api.install(demo.page);
  return api;
}

async function open(demo) {
  await demo.go(`/parties/${dinoParty}/checklist`, { ready: false });
  await demo.app().getByRole('heading', { level: 1, name: 'Checklist' }).waitFor();
  await demo.app().getByRole('progressbar').waitFor();
  await demo.pause(800);
}

async function openMenu(demo, title) {
  const trigger = demo.app().getByRole('button', { name: `More actions for ${title}` });
  await trigger.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  await demo.pause(700);
  await demo.click(trigger);
  await demo.pause(1200);
}

export default [
  {
    name: 'checklist-desktop',
    run: async (demo) => {
      await fake(demo);
      await open(demo);
      demo.mark();
      const app = demo.app();
      await demo.pause(4000);
      await demo.click(app.locator('li[giddy-task]').filter({ hasText: 'Order the cake' }).getByRole('checkbox'));
      await demo.pause(2500);
      await openMenu(demo, 'Send an RSVP reminder');
      await demo.click(app.getByRole('menuitem', { name: 'Let Giddy do it' }));
      await demo.pause(2500);
      await demo.click(app.getByRole('button', { name: 'Send it' }));
      await demo.pause(3000);
      await app.locator('main').evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await demo.pause(800);
      await demo.click(app.locator('.page-header').getByRole('button', { name: 'Add task' }));
      const dialog = app.getByRole('dialog', { name: 'Add a task' });
      await demo.type(dialog.getByLabel('Task', { exact: true }), 'Buy number 7 candle and a lighter');
      await dialog.getByLabel('Due').fill('2026-11-12');
      await demo.pause(1500);
      await demo.click(dialog.getByLabel('Who'));
      await dialog.getByLabel('Who').selectOption({ label: 'Kemi' });
      await demo.pause(1200);
      await demo.click(dialog.getByRole('button', { name: 'Add task' }));
      await demo.pause(3000);
    },
  },
  {
    name: 'coplanner-phone',
    phone: true,
    run: async (demo) => {
      const api = await fake(demo);
      const listening = demo.page.waitForResponse((r) => new URL(r.url()).pathname === '/api/live-updates');
      await open(demo);
      await listening;
      demo.mark();
      const app = demo.app();
      await demo.pause(3500);
      api.checklistStore.tick(dinoParty, 'Order the cake');
      api.guestStore.push({
        guestId: null,
        kind: 'task',
        tone: 'success',
        title: 'Kemi ticked off Order the cake',
        text: 'On the checklist for Zuri’s Dino Dig 7th.',
        action: null,
      });
      await app.getByText('Kemi ticked off Order the cake').waitFor();
      await demo.pause(3000);
      const done = app.getByRole('region', { name: /^Done · / });
      await done.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'smooth' }));
      await demo.pause(3000);
    },
  },
];
