// Stills for video 02, made with tools/video-record/capture-shots.mjs against the fake API.
import { planTurn } from '../../../../tools/video-record/giddy-fake-api.mjs';

const chat = (page) => page.getByRole('heading', { level: 1, name: 'Ask Giddy' }).waitFor();

export default [
  { name: 'phone-greeting', phone: true, path: '/ask-giddy', ready: chat },
  {
    name: 'desktop-thinking',
    path: '/ask-giddy',
    prepare: async (page, api) => {
      api.script = [{ ...planTurn(4000), outcome: 'hang' }];
    },
    ready: async (page) => {
      await chat(page);
      await page.getByRole('textbox', { name: 'Message Giddy' }).fill('Plan Zuri’s 7th, 15 kids, $800, Leslieville');
      await page.keyboard.press('Enter');
      await page.locator('.tool-step--done').first().waitFor({ timeout: 10000 });
    },
  },
  {
    name: 'phone-plan-failed',
    phone: true,
    path: '/ask-giddy',
    prepare: async (page, api) => {
      api.script = [planTurn(50)];
      api.applyFailures = 1;
    },
    ready: async (page) => {
      await chat(page);
      await page.getByRole('textbox', { name: 'Message Giddy' }).fill('Plan it');
      await page.keyboard.press('Enter');
      await page.getByRole('button', { name: 'Use this plan' }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Use this plan' }).click();
      await page.getByText('That didn’t go through').waitFor();
    },
  },
  { name: 'desktop-settings', path: '/settings', ready: (page) => page.getByRole('heading', { name: 'What Giddy remembers' }).waitFor() },
];
