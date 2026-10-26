// Screen recordings for video 15, made with tools/video-record/record-clips.mjs against the
// running frontend and the e2e suite's fake API (tools/video-record/e2e-fake-api.mjs).
import { loadFakeApi } from '../../../../tools/video-record/e2e-fake-api.mjs';

const zurisSixth = '6d1e2f30-4152-4637-8849-5a6b7c8d9e01';

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
    name: 'thank-yous-desktop',
    run: async (demo) => {
      await fake(demo);
      await demo.go(`/parties/${zurisSixth}/wrap-up`, { ready: false });
      const app = demo.app();
      await app.getByRole('heading', { level: 1, name: 'Wrap-up' }).waitFor();
      await app.getByRole('list', { name: 'Thank-you notes' }).waitFor();
      await demo.pause(600);
      demo.mark();
      await demo.pause(4500);
      await demo.click(app.getByRole('button', { name: 'Edit the note to Leo Rossi' }));
      const dialog = app.getByRole('dialog', { name: 'Thank-you note to Leo Rossi' });
      await dialog.waitFor();
      await demo.pause(1000);
      await demo.type(dialog.getByLabel(/^What Leo gave/), 'T. rex plush');
      await demo.pause(700);
      await demo.click(dialog.getByRole('button', { name: 'Save note' }));
      await app.getByText('Thank you so much for the T. rex plush, Leo!').waitFor();
      await app.getByText('Thank you so much for the T. rex plush, Leo!').scrollIntoViewIfNeeded();
      await demo.pause(3000);
      const send = app.getByRole('button', { name: /^Send \d+ notes$/ });
      await send.scrollIntoViewIfNeeded();
      await demo.pause(800);
      await demo.click(send);
      await app.getByText('13 thank-you notes sent').waitFor();
      await app.getByText('13 thank-you notes sent').scrollIntoViewIfNeeded();
      await demo.pause(3500);
    },
  },
  {
    name: 'rate-phone',
    phone: true,
    run: async (demo) => {
      await fake(demo);
      await demo.go(`/parties/${zurisSixth}/wrap-up`, { ready: false });
      const app = demo.app();
      const ratings = app.getByRole('region', { name: 'How was everyone?' });
      await ratings.waitFor();
      await ratings.scrollIntoViewIfNeeded();
      await demo.pause(600);
      demo.mark();
      await demo.pause(1500);
      const pool = ratings.getByRole('group', { name: 'Splash & Giggle Pool' });
      await demo.click(pool.getByRole('button', { name: '5 stars' }));
      await demo.pause(2000);
      await demo.click(ratings.getByRole('button', { name: 'Add a review of Splash & Giggle Pool' }));
      const dialog = app.getByRole('dialog', { name: 'Review Splash & Giggle Pool' });
      await dialog.waitFor();
      await demo.type(dialog.getByLabel(/^Your review/), 'The lifeguards ran a mermaid relay.');
      await demo.click(dialog.getByRole('button', { name: 'Save review' }));
      await dialog.waitFor({ state: 'detached' });
      await demo.pause(1500);
      const numbers = app.getByRole('region', { name: 'Final numbers' });
      await numbers.scrollIntoViewIfNeeded();
      await demo.pause(3000);
      const save = app.getByRole('button', { name: 'Save as template' });
      await save.scrollIntoViewIfNeeded();
      await demo.click(save);
      await app.getByText('Plan saved for next time').waitFor();
      await demo.pause(2500);
      await demo.click(app.getByRole('link', { name: 'Start a party from it' }));
      await app.getByText('Starting from Zuri’s 6th: Mermaid Splash').waitFor();
      await demo.pause(3000);
    },
  },
];
