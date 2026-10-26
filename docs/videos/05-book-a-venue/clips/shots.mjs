// Stills for video 05, made with tools/video-record/capture-shots.mjs against the e2e fake API.
export const fake = 'e2e';

const dinoDen = 'b1000000-0000-4000-8000-000000000001';
const dinoParty = '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6';
const overview = `/parties/${dinoParty}`;
const settle = (page) => page.waitForTimeout(600);

export default [
  {
    name: 'desktop-hold',
    path: overview,
    prepare: async (page, api) => api.bookingStore.seed(dinoParty, 'holding', 'tok_3ds'),
    ready: async (page) => {
      await page.getByText('is holding 1:00 pm for you').waitFor();
      await settle(page);
    },
  },
  {
    name: 'desktop-confirmed',
    path: overview,
    prepare: async (page, api) => {
      api.bookingStore.seed(dinoParty, 'confirmed');
      api.bookingStore.disruptions.push({
        title: 'Sat 14 Nov is a TTC weekend closure on Queen St E',
        text: 'The 501 streetcar is replaced by buses between Broadview and Neville Park. Tell guests to leave extra time.',
      });
    },
    ready: async (page) => {
      await page.getByText('TTC weekend closure').waitFor();
      await settle(page);
    },
  },
  {
    name: 'desktop-declined',
    path: overview,
    prepare: async (page, api) => api.bookingStore.seed(dinoParty, 'declined', 'tok_declined'),
    ready: async (page) => {
      await page.getByText('Your deposit payment didn’t go through').waitFor();
      await settle(page);
    },
  },
  {
    name: 'desktop-non-refundable',
    path: `/venues/${dinoDen}?date=2026-11-14&partyId=${dinoParty}`,
    prepare: async (page, api) => {
      api.bookingStore.refundable = false;
      api.bookingStore.seed(dinoParty, 'confirmed');
    },
    ready: async (page) => {
      await page.getByRole('button', { name: 'Cancel booking' }).click();
      await page.getByRole('dialog').waitFor();
      await page.waitForTimeout(800);
    },
  },
  {
    name: 'desktop-venue-timeout',
    path: `/venues/${dinoDen}?date=2026-11-14&partyId=${dinoParty}`,
    prepare: async (page, api) => {
      api.bookingStore.venueTimesOut = true;
    },
    ready: async (page) => {
      await page.getByRole('button', { name: 'Book 1:00–3:30 pm' }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('textbox', { name: 'Mobile' }).fill('416-555-0188');
      await dialog.getByRole('button', { name: 'Pay $100 and book' }).click();
      await dialog.getByText('That didn’t go through').waitFor();
      await page.waitForTimeout(800);
    },
  },
];
