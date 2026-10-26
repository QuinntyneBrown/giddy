import { expect, test as base } from '@playwright/test';
import { FakeApi } from './fake-api';

export const test = base.extend<{ fakeApi: FakeApi; cookieChoice: 'essential' | null }>({
  /** The visitor already chose cookies on this device, so the consent bar stays out of the way. */
  cookieChoice: ['essential', { option: true }],
  fakeApi: [
    async ({ page, cookieChoice }, use) => {
      if (cookieChoice)
        await page.addInitScript((choice) => {
          if (!localStorage.getItem('giddy.cookie-choice'))
            localStorage.setItem(
              'giddy.cookie-choice',
              JSON.stringify({ choice, savedAt: Date.now() }),
            );
        }, cookieChoice);
      const fakeApi = new FakeApi();
      await fakeApi.install(page);
      await use(fakeApi);
      expect(fakeApi.unrouted, 'every API request must be answered by the fake API').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
