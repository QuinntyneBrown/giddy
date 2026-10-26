// Screen recordings for video 02, made with tools/video-record/record-clips.mjs against the
// running frontend. The backend is faked like the e2e suite (tools/video-record/giddy-fake-api.mjs).
import { installFakeApi, planTurn } from '../../../../tools/video-record/giddy-fake-api.mjs';

async function openChat(demo) {
  await demo.go('/ask-giddy', { ready: false });
  await demo.app().getByRole('heading', { level: 1, name: 'Ask Giddy' }).waitFor();
  await demo.pause(600);
}

export default [
  {
    name: 'plan-desktop',
    run: async (demo) => {
      await installFakeApi(demo.page);
      await openChat(demo);
      demo.mark();
      const app = demo.app();
      await demo.pause(2500);
      await demo.click(app.getByRole('button', { name: 'Plan Zuri’s 7th on Sat 14 Nov' }));
      await app.locator('.plan-card').waitFor({ timeout: 15000 });
      await demo.pause(1500);
      await demo.moveTo(app.locator('.plan-card .badge'));
      await demo.pause(2000);
      await demo.click(app.getByRole('button', { name: 'Use this plan' }));
      await app.getByRole('dialog').waitFor();
      await demo.pause(3500);
      await demo.click(app.getByRole('dialog').getByRole('button', { name: 'Use this plan' }));
      await app.getByText('Plan saved to Zuri’s Dino Dig 7th').waitFor();
      await demo.pause(2500);
    },
  },
  {
    name: 'stop-phone',
    phone: true,
    run: async (demo) => {
      const api = await installFakeApi(demo.page);
      api.script = [
        { ...planTurn(1500), outcome: 'hang' },
        {
          steps: ['Found 4 bakeries with peanut-free cakes'],
          outcome: 'reply',
          stepMs: 1200,
          reply: {
            text: 'Sweet Rex makes a dino cake that’s both nut-free and gluten-free. Want me to look for a gluten-free pizza too?',
            suggestions: ['Yes, add a GF pizza', 'Keep the regular cake', 'Show other bakeries'],
          },
        },
      ];
      await openChat(demo);
      demo.mark();
      const app = demo.app();
      await demo.pause(1000);
      await demo.type(app.getByRole('textbox', { name: 'Message Giddy' }), 'Plan the whole party');
      await demo.press('Enter');
      await app.locator('.tool-step--done').first().waitFor();
      await demo.pause(1200);
      await demo.click(app.getByRole('button', { name: 'Stop Giddy' }));
      await demo.pause(1800);
      await demo.type(app.getByRole('textbox', { name: 'Message Giddy' }), 'Can the cake be gluten-free?');
      await demo.press('Enter');
      await app.getByRole('button', { name: 'Yes, add a GF pizza' }).waitFor({ timeout: 10000 });
      await demo.pause(2000);
    },
  },
  {
    name: 'recover-desktop',
    run: async (demo) => {
      const api = await installFakeApi(demo.page);
      api.sendFailures = 1;
      api.script = [{ steps: [], outcome: 'fail', stepMs: 800 }];
      await openChat(demo);
      demo.mark();
      const app = demo.app();
      await demo.pause(800);
      await demo.type(app.getByRole('textbox', { name: 'Message Giddy' }), 'Can we add a piñata?');
      await demo.press('Enter');
      await app.getByText('This message wasn’t sent').waitFor();
      await demo.pause(2000);
      await demo.click(app.getByRole('button', { name: 'Send again' }));
      await app.getByText('Giddy can’t answer right now', { exact: true }).waitFor({ timeout: 10000 });
      await demo.pause(2500);
    },
  },
  {
    name: 'memory-desktop',
    run: async (demo) => {
      await installFakeApi(demo.page);
      await demo.go('/settings', { ready: false });
      await demo.app().getByRole('heading', { level: 1, name: 'Settings' }).waitFor();
      demo.mark();
      const app = demo.app();
      await demo.pause(1500);
      await demo.click(app.getByRole('button', { name: 'Forget: You prefer venues with parking' }));
      await demo.pause(2000);
    },
  },
];
