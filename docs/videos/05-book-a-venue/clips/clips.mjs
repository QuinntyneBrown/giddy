// Screen recordings for video 05, made with tools/video-record/record-clips.mjs against the
// running frontend and the e2e suite's fake API (tools/video-record/e2e-fake-api.mjs).
import { loadFakeApi } from '../../../../tools/video-record/e2e-fake-api.mjs';

const dinoDen = 'b1000000-0000-4000-8000-000000000001';
const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';
const venuePage = `/venues/${dinoDen}?date=2026-11-14&partyId=${dinoParty}`;

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
    name: 'book-desktop',
    run: async (demo) => {
      await fake(demo);
      await open(demo, venuePage, 'Dino Den Play Café');
      demo.mark();
      const app = demo.app();
      await demo.pause(2000);
      await demo.click(app.getByRole('button', { name: 'Book 1:00–3:30 pm' }));
      const dialog = app.getByRole('dialog');
      await dialog.waitFor();
      await demo.pause(4000);
      await demo.click(dialog.getByRole('button', { name: 'Pay $100 and book' }));
      await demo.pause(3000);
      await demo.type(dialog.getByRole('textbox', { name: 'Mobile' }), '416-555-0188');
      await demo.pause(800);
      await demo.click(dialog.getByRole('button', { name: 'Pay $100 and book' }));
      await dialog.getByRole('heading', { name: 'You’re booked! 🎉' }).waitFor();
      await demo.pause(4500);
      await demo.click(dialog.getByRole('button', { name: 'Close', exact: true }).last());
      await demo.pause(4000);
    },
  },
  {
    name: 'taken-desktop',
    run: async (demo) => {
      const api = await fake(demo);
      await open(demo, venuePage, 'Dino Den Play Café');
      demo.mark();
      const app = demo.app();
      await demo.pause(1000);
      await demo.click(app.getByRole('button', { name: 'Book 1:00–3:30 pm' }));
      const dialog = app.getByRole('dialog');
      await dialog.waitFor();
      await demo.type(dialog.getByRole('textbox', { name: 'Mobile' }), '416-555-0188');
      api.bookingStore.takenByOthers.add(`${dinoDen}@13:00`);
      await demo.pause(800);
      await demo.click(dialog.getByRole('button', { name: 'Pay $100 and book' }));
      await demo.pause(4000);
      await demo.click(dialog.getByRole('button', { name: 'Book 4:00 pm' }));
      await demo.pause(2500);
      await demo.click(dialog.getByRole('button', { name: 'Pay $100 and book' }));
      await dialog.getByRole('heading', { name: 'You’re booked! 🎉' }).waitFor();
      await demo.pause(3500);
    },
  },
  {
    name: 'bank-check-phone',
    phone: true,
    run: async (demo) => {
      await fake(demo);
      await open(demo, venuePage, 'Dino Den Play Café');
      demo.mark();
      const app = demo.app();
      await app.getByRole('button', { name: 'Book 1:00–3:30 pm' }).scrollIntoViewIfNeeded();
      await demo.pause(1200);
      await demo.click(app.getByRole('button', { name: 'Book 1:00–3:30 pm' }));
      const dialog = app.getByRole('dialog');
      await dialog.waitFor();
      await demo.type(dialog.getByRole('textbox', { name: 'Mobile' }), '416-555-0188');
      await demo.click(dialog.getByRole('radio', { name: /^Add a card/ }));
      await demo.pause(1200);
      await dialog.getByRole('combobox', { name: 'Card' }).selectOption('tok_3ds');
      await demo.pause(1500);
      await demo.click(dialog.getByRole('button', { name: 'Pay $100 and book' }));
      await dialog.getByRole('region', { name: 'Your bank’s check' }).waitFor();
      await demo.pause(4500);
      await demo.click(dialog.getByRole('button', { name: 'Approve' }));
      await dialog.getByRole('heading', { name: 'You’re booked! 🎉' }).waitFor();
      await demo.pause(3500);
    },
  },
  {
    name: 'cancel-desktop',
    run: async (demo) => {
      const api = await fake(demo);
      api.bookingStore.seed(dinoParty, 'confirmed');
      await open(demo, venuePage, 'Dino Den Play Café');
      demo.mark();
      const app = demo.app();
      await demo.pause(2500);
      await demo.click(app.getByRole('button', { name: 'Cancel booking' }));
      await app.getByRole('dialog').waitFor();
      await demo.pause(4500);
      await demo.click(app.getByRole('button', { name: 'Cancel and refund $100' }));
      await demo.pause(4500);
    },
  },
];
