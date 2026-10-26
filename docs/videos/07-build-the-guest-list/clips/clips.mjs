// Screen recordings for video 07, made with tools/video-record/record-clips.mjs against the
// running frontend and the e2e suite's fake API (tools/video-record/e2e-fake-api.mjs).
import { loadFakeApi } from '../../../../tools/video-record/e2e-fake-api.mjs';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';
const classList = [
  'Child,Parent,Email,Mobile',
  'Maya Chen,Lily Chen,lily@example.com,',
  'Theo Laurent,Claire Laurent,claire@example.com,416-555-0102',
  'Nadia Karim,Samir Karim,samir@example.com,',
  'Omar Siddiqui,Huda Siddiqui,,',
  'Ruby Clarke,Emma Clarke,emma@example.com,',
].join('\n');

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
    name: 'find-desktop',
    run: async (demo) => {
      await fake(demo);
      await open(demo, `/parties/${dinoParty}/guests`, 'Guests');
      demo.mark();
      const app = demo.app();
      await demo.pause(1500);
      const search = app.getByRole('searchbox', { name: 'Search kids or parents' });
      await demo.type(search, 'chen');
      await demo.pause(2000);
      await search.fill('');
      await demo.pause(800);
      const chips = app.getByRole('group', { name: 'Filter guests' });
      await demo.click(chips.getByRole('button', { name: /^Waiting \d+$/ }));
      await demo.pause(2000);
      await demo.click(chips.getByRole('button', { name: /^Allergies \d+$/ }));
      await demo.pause(2000);
      await demo.click(chips.getByRole('button', { name: /^All \d+$/ }));
      await demo.type(search, 'Samira');
      await demo.pause(1500);
      await demo.click(app.getByRole('button', { name: 'Add “Samira” as a guest' }));
      const dialog = app.getByRole('dialog', { name: 'Add a guest' });
      await dialog.waitFor();
      await demo.type(dialog.getByRole('textbox', { name: 'Child’s name' }), ' Haddad');
      await demo.type(dialog.getByRole('textbox', { name: 'Parent’s name' }), 'Rania Haddad');
      await demo.type(dialog.getByRole('textbox', { name: 'Parent’s email' }), 'rania.haddad@example.com');
      await demo.pause(1500);
      await demo.click(dialog.getByRole('button', { name: 'Add and invite' }));
      await demo.pause(3500);
    },
  },
  {
    name: 'remove-phone',
    phone: true,
    run: async (demo) => {
      await fake(demo);
      await open(demo, `/parties/${dinoParty}/guests`, 'Guests');
      demo.mark();
      const app = demo.app();
      const remove = app.getByRole('button', { name: 'Remove Leo Rossi' });
      await remove.scrollIntoViewIfNeeded();
      await demo.pause(1500);
      await demo.click(remove);
      await app.getByRole('dialog').waitFor();
      await demo.pause(3500);
      await demo.click(app.getByRole('button', { name: 'Remove Leo Rossi' }).last());
      await demo.pause(2500);
      await demo.click(app.getByRole('button', { name: 'Undo' }));
      await demo.pause(3000);
    },
  },
  {
    name: 'import-desktop',
    run: async (demo) => {
      const api = await fake(demo);
      api.guestStore.guests = api.guestStore.guests.slice(0, 8);
      await open(demo, `/parties/${dinoParty}/guests`, 'Guests');
      demo.mark();
      const app = demo.app();
      await demo.pause(1000);
      await demo.click(app.getByRole('button', { name: 'Import', exact: true }));
      const dialog = app.getByRole('dialog', { name: 'Import guests' });
      await dialog.waitFor();
      await demo.pause(2500);
      await dialog.locator('input[type=file]').setInputFiles({ name: 'Grade 2 Room 12 class list.csv', mimeType: 'text/csv', buffer: Buffer.from(classList) });
      await demo.pause(5000);
      await demo.click(dialog.getByRole('button', { name: /^Import \d+ guests$/ }));
      await dialog.getByText(/guests imported/).waitFor();
      await demo.pause(3500);
      await demo.click(dialog.getByRole('button', { name: 'Done' }));
      await demo.pause(2500);
    },
  },
];
