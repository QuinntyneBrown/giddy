// Loads the e2e suite's FakeApi (frontend/e2e/fixtures/fake-api.ts) for screen recordings, so
// videos and tests share one fake backend. The TypeScript is bundled with the frontend's esbuild.
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const require = createRequire(join(repo, 'frontend', 'package.json'));

let loaded;

/** Returns the FakeApi class; call `new FakeApi().install(page)` and change its stores as tests do. */
export async function loadFakeApi() {
  if (!loaded) {
    const esbuild = require('esbuild');
    const out = join(repo, '.cache', 'videos', 'fake-api.mjs');
    mkdirSync(dirname(out), { recursive: true });
    await esbuild.build({
      entryPoints: [join(repo, 'frontend', 'e2e', 'fixtures', 'fake-api.ts')],
      bundle: true,
      format: 'esm',
      platform: 'node',
      external: ['@playwright/test'],
      outfile: out,
      logLevel: 'error',
    });
    loaded = (await import(`${pathToFileURL(out).href}?t=${Date.now()}`)).FakeApi;
  }
  return loaded;
}
