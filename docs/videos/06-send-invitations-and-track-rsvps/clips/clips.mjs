// Screen recordings for video 06, made with tools/video-record/record-clips.mjs against the
// running frontend and the e2e suite's fake API (tools/video-record/e2e-fake-api.mjs).
import { loadFakeApi } from '../../../../tools/video-record/e2e-fake-api.mjs';

const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

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
    name: 'invite-desktop',
    run: async (demo) => {
      const api = await fake(demo);
      api.guestStore.notInvitedYet();
      await open(demo, `/parties/${dinoParty}/invite`, 'Invitations');
      demo.mark();
      const app = demo.app();
      await demo.pause(3000);
      await demo.click(app.getByRole('radio', { name: 'Volcano' }));
      await demo.pause(1500);
      await demo.click(app.getByRole('radio', { name: 'Dino green' }));
      await demo.pause(800);
      const headline = app.getByRole('textbox', { name: 'Headline' });
      await headline.fill('');
      await demo.type(headline, 'Dig in with Zuri!');
      await demo.pause(1500);
      await demo.click(app.getByRole('button', { name: 'Send me a test' }));
      await demo.pause(2500);
      await demo.click(app.getByRole('button', { name: 'Send to 16 families' }));
      await app.getByText('Invites sent to 16 families').waitFor();
      await demo.pause(4500);
    },
  },
  {
    name: 'rsvp-phone',
    phone: true,
    run: async (demo) => {
      const api = await fake(demo);
      api.session = null;
      api.guestStore.guests.find((g) => g.childName === 'Aisha Mohamed').rsvp = 'waiting';
      await demo.go('/rsvp/aisha-token', { ready: false });
      await demo.app().getByRole('heading', { level: 2, name: 'Will Aisha come?' }).waitFor();
      demo.mark();
      const app = demo.app();
      await demo.pause(2500);
      await app.getByRole('heading', { level: 2, name: 'Will Aisha come?' }).scrollIntoViewIfNeeded();
      await demo.pause(800);
      await demo.click(app.getByRole('radio', { name: 'Yes, Aisha’s coming!' }));
      await demo.type(app.getByRole('textbox', { name: 'Allergies or dietary needs' }), 'Peanut');
      await demo.click(app.getByRole('radio', { name: 'Yes, I’ll stay' }));
      await demo.type(app.getByRole('textbox', { name: /^Mobile/ }), '416-555-0150');
      await demo.pause(600);
      await demo.click(app.getByRole('button', { name: 'Send my reply' }));
      await app.getByText('Yay! Aisha is coming').waitFor();
      await app.getByText('Yay! Aisha is coming').scrollIntoViewIfNeeded();
      await demo.pause(4500);
    },
  },
  {
    name: 'live-desktop',
    run: async (demo) => {
      const api = await fake(demo);
      await open(demo, `/parties/${dinoParty}/guests`, 'Guests');
      demo.mark();
      const app = demo.app();
      await demo.pause(2500);
      const aisha = api.guestStore.guests.find((g) => g.childName === 'Aisha Mohamed');
      aisha.rsvp = 'coming';
      aisha.allergies = 'Peanut';
      api.guestStore.push({
        guestId: aisha.id,
        kind: 'replied',
        tone: 'success',
        title: 'Aisha is coming!',
        text: 'Hodan Mohamed replied. 12 coming so far.',
        action: { label: 'View guests', kind: 'view-guests' },
      });
      api.guestStore.push({
        guestId: aisha.id,
        kind: 'allergy',
        tone: 'warning',
        title: 'New allergy: peanut',
        text: 'Hodan Mohamed says Aisha has a peanut allergy. Let Dino Den Play Café know.',
        action: { label: 'Share with Dino Den Play Café', kind: 'share-allergies' },
      });
      await app.getByText('New allergy: peanut').waitFor({ timeout: 8000 });
      await demo.pause(4000);
      await demo.click(app.getByRole('button', { name: 'Share with Dino Den Play Café' }));
      await demo.pause(4000);
    },
  },
  {
    name: 'reminders-desktop',
    run: async (demo) => {
      await fake(demo);
      await open(demo, `/parties/${dinoParty}/guests`, 'Guests');
      demo.mark();
      const app = demo.app();
      await demo.pause(1500);
      for (const child of ['Aisha Mohamed', 'Mateo García', 'Ava Wilson']) {
        const box = app.getByRole('checkbox', { name: `Select ${child}` });
        await box.scrollIntoViewIfNeeded();
        await demo.click(box);
        await demo.pause(600);
      }
      await demo.pause(2500);
      await demo.click(app.getByRole('button', { name: 'Send reminder (3)' }));
      await demo.pause(5500);
    },
  },
];
