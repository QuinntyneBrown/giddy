// Screen recordings for video 12, made with tools/video-record/record-clips.mjs against the
// running frontend and the e2e suite's fake API (tools/video-record/e2e-fake-api.mjs).
import { loadFakeApi } from '../../../../tools/video-record/e2e-fake-api.mjs';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

async function fake(demo) {
  const FakeApi = await loadFakeApi();
  const api = new FakeApi();
  await api.install(demo.page);
  return api;
}

async function centre(demo, locator) {
  await locator.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  await demo.pause(900);
}

export default [
  {
    name: 'day-phone',
    phone: true,
    run: async (demo) => {
      await fake(demo);
      // 1:40 pm on the party day in Toronto, during the show.
      await demo.page.clock.install({ time: new Date('2026-11-14T18:40:00Z') });
      await demo.page.clock.resume();
      await demo.go(`/parties/${dinoParty}/day`, { ready: false });
      const app = demo.app();
      await app.getByRole('list', { name: 'Run sheet' }).waitFor();
      await demo.pause(600);
      demo.mark();
      await demo.pause(2500);
      await centre(demo, app.locator('[aria-current="step"]'));
      await demo.pause(3500);
      await demo.page.clock.fastForward('36:00');
      await demo.pause(1500);
      await centre(demo, app.locator('[aria-current="step"]'));
      await demo.pause(3000);
      await centre(demo, app.getByRole('region', { name: 'Quick calls' }));
      await demo.pause(3000);
      await centre(demo, app.getByRole('region', { name: 'Allergy check' }));
      await demo.pause(3000);
    },
  },
  {
    name: 'offline-desktop',
    run: async (demo) => {
      const api = await fake(demo);
      await demo.go(`/parties/${dinoParty}/checklist`, { ready: false });
      const app = demo.app();
      await app.getByRole('progressbar').waitFor();
      await demo.pause(600);
      demo.mark();
      await demo.pause(2000);
      await demo.page.context().setOffline(true);
      await demo.pause(3000);
      const cake = app.locator('li[giddy-task]').filter({ hasText: 'Order the cake' });
      await demo.click(cake.getByRole('checkbox'));
      await demo.pause(2500);
      await demo.page.context().setOffline(false);
      await app.getByText('1 change synced').waitFor();
      await demo.pause(3500);
      await demo.click(app.getByRole('button', { name: 'Dismiss' }).first());
      await demo.page.context().setOffline(true);
      await demo.pause(1500);
      const rsvp = app.locator('li[giddy-task]').filter({ hasText: 'Send an RSVP reminder' });
      await demo.click(rsvp.getByRole('checkbox'));
      api.checklistStore.rename(dinoParty, 'Send an RSVP reminder', 'Nudge 3 families about RSVPs', 'Kemi');
      await demo.pause(1500);
      await demo.page.context().setOffline(false);
      await app.getByText('1 change couldn’t sync').waitFor();
      await demo.pause(3000);
      await demo.click(app.getByRole('button', { name: 'Review change' }));
      await demo.pause(3500);
      await demo.click(app.getByRole('button', { name: 'Keep mine' }));
      await demo.pause(3000);
    },
  },
];
