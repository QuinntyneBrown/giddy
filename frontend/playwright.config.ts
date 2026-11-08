import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://127.0.0.1:4200', ...devices['Desktop Chrome'] },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run start -- --host 127.0.0.1',
      url: 'http://127.0.0.1:4200',
      reuseExistingServer: true,
    },
    {
      // The marketing site (L2-095), its own application beside the app.
      command: 'npm run start:marketing -- --host 127.0.0.1',
      url: 'http://127.0.0.1:4300',
      reuseExistingServer: true,
    },
  ],
});
