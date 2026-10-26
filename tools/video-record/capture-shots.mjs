#!/usr/bin/env node
// Still screenshots of the real UI for a video folder, against the fake API.
// Runs each shot in <folder>/clips/shots.mjs and writes <folder>/shots/<name>.png.
//
//   node tools/video-record/capture-shots.mjs docs/videos/NN-topic [--base http://localhost:4200]
//
// shots.mjs exports default [{ name, phone?, colorScheme?, path, prepare?: async (page, api) => {}, ready: async (page) => {} }].
import { existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installFakeApi } from './giddy-fake-api.mjs';
import { loadFakeApi } from './e2e-fake-api.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const args = process.argv.slice(2);
const folder = resolve(args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--')) ?? '');
const baseIndex = args.indexOf('--base');
const base = baseIndex >= 0 ? args[baseIndex + 1] : (process.env.DEMO_BASE_URL ?? 'http://localhost:4200');
const require = createRequire(join(repo, 'frontend', 'package.json'));
const { chromium } = require('playwright');
const sizes = { desktop: { width: 1408, height: 792 }, phone: { width: 390, height: 844 } };

const file = join(folder, 'clips', 'shots.mjs');
if (!existsSync(file)) throw new Error(`${file} not found`);
const shotsModule = await import(pathToFileURL(file).href);
const shots = shotsModule.default;
// Newer videos share the e2e suite's fake API: `export const fake = 'e2e'` in shots.mjs.
const FakeApi = shotsModule.fake === 'e2e' ? await loadFakeApi() : null;
mkdirSync(join(folder, 'shots'), { recursive: true });
const browser = await chromium.launch();
for (const shot of shots) {
  const context = await browser.newContext({
    viewport: sizes[shot.phone ? 'phone' : 'desktop'],
    deviceScaleFactor: shot.phone ? 2 : 1,
    colorScheme: shot.colorScheme ?? 'light',
    locale: 'en-CA',
    timezoneId: 'America/Toronto',
  });
  const page = await context.newPage();
  let api;
  if (FakeApi) {
    api = new FakeApi();
    await api.install(page);
  } else {
    api = await installFakeApi(page);
  }
  await shot.prepare?.(page, api);
  await page.goto(new URL(shot.path, base).href);
  await shot.ready(page);
  await page.waitForTimeout(400);
  const out = join(folder, 'shots', `${shot.name}.png`);
  await page.screenshot({ path: out });
  console.log(out);
  await context.close();
}
await browser.close();
