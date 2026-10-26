# Giddy Web

Angular application for Giddy, the birthday planner for GTA families.

## Workspace

| Path                  | Library             | Contents                                                             |
| --------------------- | ------------------- | -------------------------------------------------------------------- |
| `src/`                | app                 | Bootstrap, routes and the application shell                          |
| `projects/components` | `@giddy/components` | Every design-system component, built once (mandatory for all UI)     |
| `projects/api`        | `@giddy/api`        | API contracts, injection tokens and HTTP implementations             |
| `projects/core`       | `@giddy/core`       | Session, connection status, section loading state and GTA formatting |
| `projects/home`       | `@giddy/home`       | Home page                                                            |
| `projects/system`     | `@giddy/system`     | 404, 403, 500 and offline pages                                      |

Styles come from `docs/design-system` (tokens and component classes) through `projects/components/src/styles/giddy.css`.

## Commands

```sh
npm ci
npm start               # http://localhost:4200 (proxy /api to the Giddy API yourself)
npm run lint            # ESLint (with template accessibility) and Stylelint
npm run format:check    # Prettier
npm run build
npx playwright test     # Chromium only; the API is faked by e2e/fixtures/fake-api.ts
```

The Playwright suite never needs a backend: `e2e/fixtures/fake-api.ts` answers every `/api` call with seeded data and fails the test on any request it does not know. Page objects in `e2e/pages/` own every selector.
