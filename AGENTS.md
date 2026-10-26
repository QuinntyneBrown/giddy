# Giddy

Giddy is an agentic birthday planner for kids in Toronto and the Greater Toronto Area (GTA). It is a responsive web application that helps parents plan a child's birthday party, from picking a venue and theme to organizing guests and activities.

## Tech stack

- **Backend:** .NET
- **Frontend:** Angular (responsive, mobile-friendly UI)

## Components library is mandatory (CRITICAL)

**Every UI component defined in the design system (`docs/design-system/`) MUST be built once in the shared components library and reused everywhere. This is not optional.**

- The components library is the single home of the design system in code: every component in `docs/design-system/`, plus the design tokens.
- The app and every feature library MUST compose their screens from it. Do NOT build, copy, restyle or wrap a design-system component inside a feature library or the app.
- If a screen needs a component the library does not have, add it to the library first, matching the design system, then use it from the feature. Never create a one-off local version.
- If an existing component is missing a variant or state that the design system defines, extend the component in the library. Do not override its styles from a feature.
- Feature libraries contain only feature-specific composition: pages, routes, feature dialogs and the glue between API services and components.
- The components library MUST NOT depend on the API client, the app or any feature library. It contains no business logic and makes no HTTP calls.
- Components MUST meet WCAG 2.2 AA, read tokens by role and expose the design system's variants, sizes and states through inputs.
- A screen that uses a hand-rolled substitute for a library component is incomplete and MUST be corrected before it is considered done.

## Architecture rules

- Business rules live in application handlers and domain services, never in endpoints or controllers.
- Endpoints require authentication by default; anonymous access is opted into explicitly per endpoint.
- Every query, search result and endpoint enforces permissions on the server. Never rely on the UI to hide data.
- The API does not apply database migrations on startup; a CLI project does. Seed data is idempotent and safe to re-run.
- Keep request logging outside the exception-handling middleware so handled response statuses are logged correctly.
- Keep secrets out of the repo; use configuration and environment variables.
- Read the relevant ADRs in `docs/adr/` before changing the areas they cover.

## One file per type

- Angular components are never single-file: each has its own `.ts`, `.html` and, when it needs styles, `.css`. No inline `template` or `styles`.
- Backend: one type per file (class, record, interface, enum), named after the type. Small nested or tightly coupled types are the exception, not the rule.
- Frontend: the same applies to services, contracts, models and tokens: one exported type per file.

## Frontend conventions

- Prettier owns formatting and the linter owns lint; CI fails on either.
- WCAG 2.2 AA on every screen: keyboard reachable, visible focus, labelled controls, sufficient contrast.
- Read design tokens by role (for example `var(--color-brand-foreground)`), never as hex values.
- Keep component styles encapsulated; global styles are limited to shared foundations and utilities.
- Declare each `ng-content` slot once. A component that renders `<a>` or `<button>` conditionally puts its slots in one `<ng-template>` and renders it with `ngTemplateOutlet` in both branches.
- API services have a contract and an injection token; pages depend on the token, not the concrete implementation.
- No inline forms in pages. Button-triggered editing opens an Angular CDK Dialog or navigates to a screen.
- Use Angular CDK Dialog/Overlay for modal behavior; never hand-roll modals.

## Testing

- Backend tests are integration tests against the API, using a fake database (no Docker, Testcontainers or running database server) and fakes behind abstractions for external dependencies (storage, email, time). Write authorization tests alongside each feature.
- Playwright uses the Page Object Model: one page object per screen, owning its selectors and interactions. Tests state intent; page objects know the DOM. Never put a selector in a test.
- Run frontend tests in Chromium only. Do not configure or run Firefox, WebKit or any other browser.
- Run axe accessibility checks on every screen.
- **The backend is faked in e2e.** The full Playwright suite MUST pass with no backend running. Every HTTP call and the auth flow are intercepted and answered by a fake API in `e2e/fixtures/`, which owns seeded in-memory data and answers the real API's contracts. An unrouted request MUST fail the test loudly. Playwright's `webServer` starts only the frontend. Keep the fake in step with the API in the same change.

## Incremental implementation and ATDD (MANDATORY)

Mocks and the design system are design artifacts. ATDD does not apply to them; do not write tests for mocks or the design system.

Every new feature or change to production behavior MUST have a requirement (`docs/specs/`), a detailed design (`docs/detailed-designs/`) and a mock (`docs/mocks/`) before implementation begins. This includes behavior changes to existing features. Documentation-only, design-system-only, mock-only and test-only changes are out of scope unless they are part of a production behavior change.

Every production behavior implementation MUST invoke and follow the `implementing-incrementally` skill before any code is written, combined with acceptance test-driven development:

1. Plan small, reviewable slices and complete one at a time.
2. For each slice, write Given-When-Then acceptance criteria, write the acceptance test, and run it to prove it fails for the expected reason BEFORE writing production code.
3. Implement only what satisfies that slice, refactor with tests green, and run the relevant regression checks.
4. Do not move to the next slice until those checks pass.

No bulk implementation, no tests added afterward, and no weakening tests to manufacture a pass. Keep the requirement, design, mock, criteria, tests and implementation aligned until the feature is complete. Keep changes small and match the existing code style.

### Never write architecture tests

Never add a test that asserts the shape of the codebase rather than its behavior: no structure, layout or naming tests, no banned-API scans, and no traceability tests that parse the specifications. Those constraints belong to the compiler, the formatter and review. A test suite exists to prove behavior.
