// Stills for video 11, made with tools/video-record/capture-shots.mjs against the e2e fake API.
export const fake = 'e2e';

const kofisDraft = '4b0c2d3e-5f60-4718-9a2b-3c4d5e6f7a80';
const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';

export default [
  {
    name: 'desktop-empty',
    path: `/parties/${kofisDraft}/checklist`,
    ready: async (page) => {
      await page.getByText('No tasks yet').waitFor();
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'desktop-all-done',
    path: `/parties/${dinoParty}/checklist`,
    prepare: async (page, api) => {
      for (const task of api.checklistStore.tasks.get(dinoParty)) {
        task.done = true;
        task.doneOn ??= '2026-10-25';
      }
    },
    ready: async (page) => {
      await page.getByText('All 10 tasks done.').waitFor();
      await page.waitForTimeout(700);
    },
  },
  {
    name: 'desktop-menu',
    path: `/parties/${dinoParty}/checklist`,
    ready: async (page) => {
      const trigger = page.getByRole('button', { name: 'More actions for Send an RSVP reminder' });
      await trigger.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await trigger.click();
      await page.getByRole('menuitem', { name: 'Delete task' }).waitFor();
      await page.waitForTimeout(700);
    },
  },
];
