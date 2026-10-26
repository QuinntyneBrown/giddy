# 14 · Manage plans and notifications

## Goal

Share or delete plans, receive and manage email, text and push notifications, change settings, and export or delete account data.

## Finish this whole journey in one run. Do not stop. (CRITICAL)

You are authorised to complete this journey through implementation, a narrated video with music, pull request and merge. Work in the four phases below, in that order. Do not pause for approval between phases. Fix failures at their root cause; do not weaken tests or quietly skip a gate. Keep a todo list until every “Done means” item is true.

Read `AGENTS.md` and the relevant ADRs before changing code. Follow its component-library, one-type-per-file, security, accessibility, Angular CDK Dialog, fake-backend e2e and Chromium-only rules exactly. Keep business rules in handlers/domain services, enforce server-side permissions on every endpoint, and keep secrets out of the repository.

Existing design artefacts are authoritative starting points, not substitutes for implementation. Inspect the matching mocks, requirements and designs first. Update them only when implementation exposes a genuine mismatch; do not add scope outside this journey.

## Phase 1: Implement Manage plans and notifications (`implementing-incrementally`)

- Requirements in scope: L2-009, L2-055 through L2-061, and L2-065 through L2-068.
- Detailed designs to implement: `family/share-party-plan, notifications/notification-centre, notifications/toasts-and-banners, notifications/deliver-messages, notifications/enable-push, account/edit-settings, account/export-and-delete-data`.
- Read the matching pages, dialogs and notifications in `docs/mocks/`, `docs/mocks/manifest.json`, `docs/specs/L2.md`, and `docs/detailed-designs/` before coding.
- Use `implementing-incrementally` before any production code. Plan thin vertical slices from the existing designs.
- For every slice, write Given/When/Then acceptance criteria, add the acceptance test first, run it to prove the intended failure, implement the minimum, refactor with tests green, then run relevant regressions.
- Add or extend shared components in the components library first. Compose every screen from that library; never make a feature-local substitute or override.
- Keep the API contracts and `e2e/fixtures/` fake API synchronized. Page objects own selectors; run axe on every affected screen at relevant phone and desktop widths.
- Run formatting, lint, API integration tests and Chromium Playwright tests required by the changed behaviour. Commit coherent completed slices.

## Phase 2: Record a narrated walkthrough with music (`creating-narrated-videos`)

Only begin after Phase 1 is green. Follow the established format in `/Users/quinntynebrown/projects/promise-hub/docs/videos/`, especially its README and a numbered neighbouring video.

- Create `docs/videos/14-manage-plans-and-notifications/` containing `README.md`, `script.md`, `slides.html`, `clips/clips.mjs`, required `shots/` assets, and generated `14-manage-plans-and-notifications.mp3` and `14-manage-plans-and-notifications.mp4`.
- In the README, state audience, prerequisites, learning objectives, key questions, code/assets on screen, run sheet, demo commands, pitfalls and references.
- Write a concise, accurate narration that demonstrates plan sharing and deletion, notification centre, settings, push, export and deletion flows; do not claim unbuilt behaviour.
- Record real desktop and phone flows against the application with its fake API. Include important success, boundary and recovery states.
- Set `<body data-music="../assets/music/on-the-beach-intro-outro.mp3">` in `slides.html`. Background music is mandatory: it must play beneath narration with the existing intro/outro fade behavior.
- Use the repository video tooling and verify audio timing, cues, clip playback, captions and final MP4. Keep generated caches ignored and commit the durable source assets and final artefacts required by the repository convention.

## Phase 3: Pull request

- Fetch `origin`, create a focused branch named `journey/14-manage-plans-and-notifications` from the current default branch, and rebase it immediately before opening the PR.
- Ensure all Phase 1 and Phase 2 artefacts are committed with clear messages. Push the branch.
- Open a pull request into the default branch. Its description must summarize the user-visible journey, requirements/designs implemented, tests and video location, plus any deferred scope.
- Wait for required checks and resolve every failure. Do not merge with a failing or incomplete check.

## Phase 4: Merge

- Once the PR is approved where repository policy requires it and all required checks are green, merge it into the default branch using the repository’s normal merge strategy.
- Verify the remote default branch contains the merge commit, the PR is merged, and the workspace is clean.

## Done means

- Manage plans and notifications works end to end exactly for the scoped requirements, with server-side authorization and accessible responsive UI.
- The documentation, shared component library, API contracts and fake e2e backend agree with the code.
- A verified narrated MP4 and its editable video sources exist at `docs/videos/14-manage-plans-and-notifications/`, with mandatory background music.
- The PR is green and merged into the default branch.

