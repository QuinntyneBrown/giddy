// Screen recordings for video 10, made with tools/video-record/record-clips.mjs against the
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
  await demo.go(`/parties/${dinoParty}/budget`, { ready: false });
  await demo.app().getByRole('heading', { level: 1, name: 'Budget' }).waitFor();
  await demo.app().getByRole('table', { name: 'Party costs' }).waitFor();
  await demo.pause(800);
}

export default [
  {
    name: 'track-desktop',
    run: async (demo) => {
      await fake(demo);
      await open(demo);
      demo.mark();
      const app = demo.app();
      await demo.pause(4000);
      await demo.moveTo(app.getByRole('table', { name: 'Party costs' }).getByText('Deposit paid'));
      await demo.pause(2500);
      await demo.click(app.locator('.page-header').getByRole('button', { name: 'Add a cost' }));
      const dialog = app.getByRole('dialog', { name: 'Add a cost' });
      await demo.type(dialog.getByLabel('What is it?'), 'Dino balloons and banner');
      await demo.type(dialog.getByLabel('Amount'), '22');
      await demo.pause(1500);
      await demo.click(dialog.getByRole('checkbox', { name: 'Already paid' }));
      await demo.pause(1200);
      await demo.click(dialog.getByRole('button', { name: 'Add cost' }));
      await demo.pause(3000);
      const edit = app.getByRole('button', { name: 'Edit Dino balloons and banner' });
      await demo.click(edit);
      const change = app.getByRole('dialog', { name: 'Change this cost' });
      await change.getByLabel('Amount').fill('');
      await demo.type(change.getByLabel('Amount'), '15');
      await demo.pause(1800);
      await demo.click(change.getByRole('button', { name: 'Save changes' }));
      await demo.pause(3000);
    },
  },
  {
    name: 'over-phone',
    phone: true,
    run: async (demo) => {
      const api = await fake(demo);
      api.budgetStore.expenses.set(dinoParty, [
        { id: 'cost-a', description: 'Balloon arch', category: 'Decorations', amount: 40, paid: false },
      ]);
      await open(demo);
      demo.mark();
      const app = demo.app();
      await demo.pause(4500);
      await demo.click(app.getByRole('button', { name: 'Swap Professor Fizz’s Volcano Lab' }));
      await demo.pause(3500);
      await demo.click(app.getByRole('button', { name: 'Swap to Rexy the Dino Visit' }));
      await demo.pause(3000);
      await demo.moveTo(app.getByRole('table', { name: 'Party costs' }).getByText('Rexy the Dino Visit'));
      await demo.pause(2500);
    },
  },
];
