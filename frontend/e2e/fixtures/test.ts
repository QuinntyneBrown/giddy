import { expect, test as base } from '@playwright/test';
import { FakeApi } from './fake-api';

export const test = base.extend<{ fakeApi: FakeApi }>({
  fakeApi: [
    async ({ page }, use) => {
      const fakeApi = new FakeApi();
      await fakeApi.install(page);
      await use(fakeApi);
      expect(fakeApi.unrouted, 'every API request must be answered by the fake API').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
