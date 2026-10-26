# Giddy mocks

Static HTML mocks for Giddy, the agentic birthday planner for kids in Toronto and the GTA. They cover every page, dialog and notification in every state. Open [index.html](index.html) straight from disk to browse them; no server or build step needed.

**Look and feel:** fun enough for kids, clear and calm for parents. The app uses a grape accent on a warm cream canvas, with "party pop" colours (sun, pink, mint, sky, orange) for tiles and avatars. Headings use rounded type, buttons are chunky and pressable, and confetti appears on hero panels. Giddy, the balloon mascot, stands in for the planning agent. Dark mode uses a night-sky palette. All of this lives in the design system: [`../design-system/tokens/tokens.css`](../design-system/tokens/tokens.css) and [`../design-system/assets/components.css`](../design-system/assets/components.css). `assets/` keeps only the mock chrome (`mock.css`, `mock.js`).

## How to view

- Open `index.html`, then any screen. The bar at the bottom of each mock jumps between its states, toggles dark mode (or press `t`) and hides itself (×).
- `?theme=dark` or `?theme=light` forces a theme; `?chrome=0` hides the mock bar and notes so the page looks exactly like the product.
- Resize to 360, 768 and 1280 px wide. Below 1024 px the sidebar becomes a bottom tab bar with "Ask Giddy" in the middle, and dialogs become bottom sheets below 640 px.
- Yellow "Note" boxes explain behaviour a static page can't show, such as timers or the date a screen is viewed on.

## Cast and catalog

<!-- Reuse this cast in every new mock so the story holds together. -->

| What | Value |
|---|---|
| Today | Sun 25 Oct 2026 (run sheet: Sat 14 Nov; wrap-up and locked overview: Sun 15 Nov) |
| Parent (signed in) | Amara Okafor · amara.okafor@example.com · 416-555-0188 · Leslieville, Toronto (M4M 1H7) |
| Co-planner | Daniel Okafor |
| Kids | Zuri, turns 7 on Sat 14 Nov 2026 (dinosaurs, science, digging) · Kofi, turns 4 on Wed 3 Feb 2027 (trains, bubbles) |
| Party | Zuri’s Dino Dig 7th · Sat 14 Nov 2026 · 1:00–3:30 pm · 16 kids invited · budget $800 · 20 days to go · plan 68% ready |
| Venue | Dino Den Play Café, 1124 Queen St E · $340 for 2.5 h · up to 20 kids · nut-free kitchen · booking DD-48213, $100 deposit paid · host Bea |
| Other venues | Little Diggers Sandbox Studio, Maple Climb Kids, Beaches Art Loft, Bounce Borough, Junction Science Hub |
| Vendors | Professor Fizz’s Volcano Lab $195 (quote, confirm by Tue 27 Oct) · Sweet Rex Bakery cake $85 ($95 gluten-free) · Pizza Nonna $110 · fossil kit loot bags $48 |
| Budget | $778 planned of $800 · $100 paid · over-budget state adds a $180 castle → $958 |
| Guests (16) | 11 coming, 3 waiting (Aisha, Mateo, Ava), 2 can’t come (Ethan, Amelia). Allergies: Arjun peanut, Maya dairy-free, Hana gluten-free |
| Checklist | 10 tasks · 3 done · 1 overdue (share allergy list, was due Sat 24 Oct) |
| Past parties | Zuri’s 6th Mermaid Splash (Sat 15 Nov 2025) · Kofi’s 3rd Little Train Day (Sat 7 Feb 2026) |

All venues, vendors and people are fictional. Neighbourhoods are real GTA places.

## Journeys covered

Each screen in `manifest.json` has a `journey` field that links it to the 15 user journeys: sign up and family profile, start a party plan, chat with Giddy, choose a theme, find, compare and book venues, entertainers, food and cake, budget, guest list, invitations and RSVPs, checklist, party-day run sheet, wrap-up, and managing plans and notifications.

## Coverage

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | invalid | submitting | success | no-results | partial | offline | thinking | failed | locked | selected | compare | unavailable | booked | food | over-budget | all-done | read | Requirements |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Landing (`landing`) | [✅](pages/landing/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-092` |
| Sign in (`sign-in`) | [✅](pages/sign-in/default.html) | ➖ | ➖ | [✅](pages/sign-in/error.html) | [✅](pages/sign-in/invalid.html) | [✅](pages/sign-in/submitting.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-002`, `L2-004` |
| Sign up (`sign-up`) | [✅](pages/sign-up/default.html) | ➖ | ➖ | [✅](pages/sign-up/error.html) | [✅](pages/sign-up/invalid.html) | [✅](pages/sign-up/submitting.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-001` |
| Forgot password (`forgot-password`) | [✅](pages/forgot-password/default.html) | ➖ | ➖ | [✅](pages/forgot-password/error.html) | [✅](pages/forgot-password/invalid.html) | [✅](pages/forgot-password/submitting.html) | [✅](pages/forgot-password/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-005` |
| Reset password (`reset-password`) | [✅](pages/reset-password/default.html) | ➖ | ➖ | [✅](pages/reset-password/error.html) | [✅](pages/reset-password/invalid.html) | [✅](pages/reset-password/submitting.html) | [✅](pages/reset-password/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-005` |
| Verify email (`verify-email`) | [✅](pages/verify-email/default.html) | ➖ | ➖ | [✅](pages/verify-email/error.html) |  |  | [✅](pages/verify-email/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-003` |
| Family setup (`onboarding`) | [✅](pages/onboarding/default.html) | ➖ | ➖ | [✅](pages/onboarding/error.html) | [✅](pages/onboarding/invalid.html) | [✅](pages/onboarding/submitting.html) | [✅](pages/onboarding/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-007`, `L2-010` |
| Not found (404) (`not-found`) | [✅](pages/not-found/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-088` |
| No access (403) (`forbidden`) | [✅](pages/forbidden/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-009`, `L2-088` |
| Server error (500) (`server-error`) | [✅](pages/server-error/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-088` |
| Offline (`offline`) | [✅](pages/offline/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-051`, `L2-088` |
| Help (`help`) | [✅](pages/help/default.html) | ➖ | ➖ | ➖ |  |  |  | [✅](pages/help/no-results.html) |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-093` |
| Terms & privacy (`legal`) | [✅](pages/legal/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-094` |
| Home (`home`) | [✅](pages/home/default.html) | [✅](pages/home/loading.html) | [✅](pages/home/empty.html) | [✅](pages/home/error.html) |  |  |  |  | [✅](pages/home/partial.html) | [✅](pages/home/offline.html) |  |  |  |  |  |  |  |  |  |  |  | `L2-008`, `L2-046`, `L2-062`, `L2-063`, `L2-064` |
| Ask Giddy (chat) (`planner-chat`) | [✅](pages/planner-chat/default.html) | [✅](pages/planner-chat/loading.html) | [✅](pages/planner-chat/empty.html) | [✅](pages/planner-chat/error.html) |  |  |  |  |  |  | [✅](pages/planner-chat/thinking.html) | [✅](pages/planner-chat/failed.html) |  |  |  |  |  |  |  |  |  | `L2-015`, `L2-016`, `L2-017`, `L2-019`, `L2-020`, `L2-021` |
| New party (`new-party`) | [✅](pages/new-party/default.html) | ➖ | ➖ | [✅](pages/new-party/error.html) | [✅](pages/new-party/invalid.html) | [✅](pages/new-party/submitting.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-010` |
| My parties (`parties`) | [✅](pages/parties/default.html) | [✅](pages/parties/loading.html) | [✅](pages/parties/empty.html) | [✅](pages/parties/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-011`, `L2-054` |
| Party overview (`party-overview`) | [✅](pages/party-overview/default.html) | [✅](pages/party-overview/loading.html) | [✅](pages/party-overview/empty.html) | [✅](pages/party-overview/error.html) |  |  |  |  | [✅](pages/party-overview/partial.html) |  |  |  | [✅](pages/party-overview/locked.html) |  |  |  |  |  |  |  |  | `L2-009`, `L2-012`, `L2-013`, `L2-054` |
| Themes (`themes`) | [✅](pages/themes/default.html) | [✅](pages/themes/loading.html) | ➖ | [✅](pages/themes/error.html) |  |  |  | [✅](pages/themes/no-results.html) |  |  |  |  |  | [✅](pages/themes/selected.html) |  |  |  |  |  |  |  | `L2-023`, `L2-024` |
| Venues (`venues`) | [✅](pages/venues/default.html) | [✅](pages/venues/loading.html) | ➖ | [✅](pages/venues/error.html) |  |  |  | [✅](pages/venues/no-results.html) |  |  |  |  |  |  | [✅](pages/venues/compare.html) |  |  |  |  |  |  | `L2-025`, `L2-027` |
| Venue detail (`venue-detail`) | [✅](pages/venue-detail/default.html) | [✅](pages/venue-detail/loading.html) | ➖ | [✅](pages/venue-detail/error.html) |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/venue-detail/unavailable.html) | [✅](pages/venue-detail/booked.html) |  |  |  |  | `L2-026` |
| Compare venues (`compare-venues`) | [✅](pages/compare-venues/default.html) | [✅](pages/compare-venues/loading.html) | [✅](pages/compare-venues/empty.html) | [✅](pages/compare-venues/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-027` |
| Fun & food (`vendors`) | [✅](pages/vendors/default.html) | [✅](pages/vendors/loading.html) | ➖ | [✅](pages/vendors/error.html) |  |  |  | [✅](pages/vendors/no-results.html) |  |  |  |  |  |  |  |  |  | [✅](pages/vendors/food.html) |  |  |  | `L2-032`, `L2-033` |
| Budget (`budget`) | [✅](pages/budget/default.html) | [✅](pages/budget/loading.html) | [✅](pages/budget/empty.html) | [✅](pages/budget/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/budget/over-budget.html) |  |  | `L2-035`, `L2-037` |
| Guests (`guests`) | [✅](pages/guests/default.html) | [✅](pages/guests/loading.html) | [✅](pages/guests/empty.html) | [✅](pages/guests/error.html) |  |  |  | [✅](pages/guests/no-results.html) |  |  |  |  |  | [✅](pages/guests/selected.html) |  |  |  |  |  |  |  | `L2-038`, `L2-042`, `L2-046` |
| Invitations (`invitation`) | [✅](pages/invitation/default.html) | [✅](pages/invitation/loading.html) | ➖ | [✅](pages/invitation/error.html) | [✅](pages/invitation/invalid.html) | [✅](pages/invitation/submitting.html) | [✅](pages/invitation/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-043` |
| RSVP (guest view) (`rsvp`) | [✅](pages/rsvp/default.html) | [✅](pages/rsvp/loading.html) | ➖ | [✅](pages/rsvp/error.html) | [✅](pages/rsvp/invalid.html) | [✅](pages/rsvp/submitting.html) | [✅](pages/rsvp/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-044` |
| Checklist (`checklist`) | [✅](pages/checklist/default.html) | [✅](pages/checklist/loading.html) | [✅](pages/checklist/empty.html) | [✅](pages/checklist/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/checklist/all-done.html) |  | `L2-047`, `L2-048` |
| Party day run sheet (`run-sheet`) | [✅](pages/run-sheet/default.html) | [✅](pages/run-sheet/loading.html) | [✅](pages/run-sheet/empty.html) | [✅](pages/run-sheet/error.html) |  |  |  |  |  | [✅](pages/run-sheet/offline.html) |  |  |  |  |  |  |  |  |  |  |  | `L2-050`, `L2-051` |
| Wrap-up (`wrap-up`) | [✅](pages/wrap-up/default.html) | [✅](pages/wrap-up/loading.html) | [✅](pages/wrap-up/empty.html) | [✅](pages/wrap-up/error.html) |  |  | [✅](pages/wrap-up/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-013`, `L2-052`, `L2-053`, `L2-054` |
| Notifications (`notifications`) | [✅](pages/notifications/default.html) | [✅](pages/notifications/loading.html) | [✅](pages/notifications/empty.html) | [✅](pages/notifications/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/notifications/read.html) | `L2-055` |
| Settings (`settings`) | [✅](pages/settings/default.html) | [✅](pages/settings/loading.html) | ➖ | [✅](pages/settings/error.html) | [✅](pages/settings/invalid.html) | [✅](pages/settings/submitting.html) | [✅](pages/settings/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-021`, `L2-058`, `L2-061`, `L2-065`, `L2-066`, `L2-067` |
| Family (`family`) | [✅](pages/family/default.html) | [✅](pages/family/loading.html) | [✅](pages/family/empty.html) | [✅](pages/family/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-007`, `L2-008`, `L2-009` |

### Dialogs

| Screen | default | busy | invalid | failed | success | confirm | Requirements |
|---|---|---|---|---|---|---|---|
| Add a child (`add-child`) | [✅](dialogs/add-child/default.html) | [✅](dialogs/add-child/busy.html) | [✅](dialogs/add-child/invalid.html) | [✅](dialogs/add-child/failed.html) |  |  | `L2-007` |
| Add a guest (`add-guest`) | [✅](dialogs/add-guest/default.html) | [✅](dialogs/add-guest/busy.html) | [✅](dialogs/add-guest/invalid.html) | [✅](dialogs/add-guest/failed.html) |  |  | `L2-039` |
| Import guests (`import-guests`) | [✅](dialogs/import-guests/default.html) | [✅](dialogs/import-guests/busy.html) | [✅](dialogs/import-guests/invalid.html) | [✅](dialogs/import-guests/failed.html) | [✅](dialogs/import-guests/success.html) |  | `L2-040` |
| Remove guest (`remove-guest`) | [✅](dialogs/remove-guest/default.html) | [✅](dialogs/remove-guest/busy.html) | ➖ | [✅](dialogs/remove-guest/failed.html) |  |  | `L2-041` |
| Book a venue (`book-venue`) | [✅](dialogs/book-venue/default.html) | [✅](dialogs/book-venue/busy.html) | [✅](dialogs/book-venue/invalid.html) | [✅](dialogs/book-venue/failed.html) | [✅](dialogs/book-venue/success.html) |  | `L2-028`, `L2-029` |
| Request a quote (`request-quote`) | [✅](dialogs/request-quote/default.html) | [✅](dialogs/request-quote/busy.html) | [✅](dialogs/request-quote/invalid.html) | [✅](dialogs/request-quote/failed.html) | [✅](dialogs/request-quote/success.html) |  | `L2-034` |
| Add a cost (`add-expense`) | [✅](dialogs/add-expense/default.html) | [✅](dialogs/add-expense/busy.html) | [✅](dialogs/add-expense/invalid.html) | [✅](dialogs/add-expense/failed.html) |  |  | `L2-036` |
| Add a task (`add-task`) | [✅](dialogs/add-task/default.html) | [✅](dialogs/add-task/busy.html) | [✅](dialogs/add-task/invalid.html) | [✅](dialogs/add-task/failed.html) |  |  | `L2-048` |
| Use Giddy’s plan (`accept-plan`) | [✅](dialogs/accept-plan/default.html) | [✅](dialogs/accept-plan/busy.html) | ➖ | [✅](dialogs/accept-plan/failed.html) |  |  | `L2-018` |
| Share plan (`share-plan`) | [✅](dialogs/share-plan/default.html) | [✅](dialogs/share-plan/busy.html) | [✅](dialogs/share-plan/invalid.html) | [✅](dialogs/share-plan/failed.html) |  |  | `L2-009` |
| Delete party (`delete-party`) | [✅](dialogs/delete-party/default.html) | [✅](dialogs/delete-party/busy.html) | [✅](dialogs/delete-party/invalid.html) | [✅](dialogs/delete-party/failed.html) |  | [✅](dialogs/delete-party/confirm.html) | `L2-014` |
| Change email (`change-email`) | [✅](dialogs/change-email/default.html) |  | [✅](dialogs/change-email/invalid.html) |  |  |  | `L2-065` |
| Delete account (`delete-account`) | [✅](dialogs/delete-account/default.html) |  | [✅](dialogs/delete-account/invalid.html) |  |  |  | `L2-067` |
| Sign out (`sign-out`) | [✅](dialogs/sign-out/default.html) | [✅](dialogs/sign-out/busy.html) | ➖ |  |  |  | `L2-006` |
| Session expired (`session-expired`) | [✅](dialogs/session-expired/default.html) | [✅](dialogs/session-expired/busy.html) | [✅](dialogs/session-expired/invalid.html) |  |  |  | `L2-006` |

### Notifications

| Screen | info | success | warning | danger | with-action | stacked | persistent | Requirements |
|---|---|---|---|---|---|---|---|---|
| Action toast (`action-toast`) | [✅](notifications/action-toast/info.html) | [✅](notifications/action-toast/success.html) | [✅](notifications/action-toast/warning.html) | [✅](notifications/action-toast/danger.html) | [✅](notifications/action-toast/with-action.html) | [✅](notifications/action-toast/stacked.html) |  | `L2-041`, `L2-042`, `L2-056` |
| Live RSVP update (`rsvp-toast`) | [✅](notifications/rsvp-toast/info.html) | [✅](notifications/rsvp-toast/success.html) | [✅](notifications/rsvp-toast/warning.html) | [✅](notifications/rsvp-toast/danger.html) |  |  |  | `L2-045`, `L2-056` |
| Booking status banner (`booking-banner`) | [✅](notifications/booking-banner/info.html) | [✅](notifications/booking-banner/success.html) | [✅](notifications/booking-banner/warning.html) | [✅](notifications/booking-banner/danger.html) |  |  | [✅](notifications/booking-banner/persistent.html) | `L2-029`, `L2-030`, `L2-031`, `L2-057` |
| Connection banner (`connection-banner`) | [✅](notifications/connection-banner/info.html) | [✅](notifications/connection-banner/success.html) | [✅](notifications/connection-banner/warning.html) | [✅](notifications/connection-banner/danger.html) |  |  |  | `L2-051`, `L2-057` |
| Verify email banner (`verify-banner`) | [✅](notifications/verify-banner/info.html) | [✅](notifications/verify-banner/success.html) | [✅](notifications/verify-banner/warning.html) | [✅](notifications/verify-banner/danger.html) |  |  | [✅](notifications/verify-banner/persistent.html) | `L2-057` |
| Cookie consent (`cookie-consent`) | [✅](notifications/cookie-consent/info.html) | [✅](notifications/cookie-consent/success.html) | ➖ | ➖ |  |  |  | `L2-068` |
| Push permission prompt (`push-prompt`) | [✅](notifications/push-prompt/info.html) | [✅](notifications/push-prompt/success.html) | [✅](notifications/push-prompt/warning.html) | ➖ |  |  |  | `L2-059` |

<!-- coverage:end -->

## Open questions and assumptions

- **Requirements.** Each screen in `manifest.json` (and the `mock:requirements` meta in every file) lists the L2 IDs from [docs/specs/L2.md](../specs/L2.md) it shows.
- **Booking and payment.** The mocks assume Giddy takes a deposit for partner venues (Visa ending 4242). If launch only links out to venues, `book-venue` becomes a "Request booking" form.
- **Agent memory.** "Giddy knows" (chat) and "What Giddy remembers" (settings) assume Giddy keeps what it learns about the family between plans, and that the parent can delete each item.
- **Guest-facing RSVP.** Guest parents reply without an account through a private link (`/rsvp/:token`).
- **Notifications.** The mocks assume email, text and push, with quiet hours from 9 pm to 7 am.
- **Fonts.** The mocks use the system rounded font stack (ui-rounded, SF Pro Rounded, Nunito when installed), so they work offline. A licensed brand font is still to be chosen.

## Re-check and re-screenshot

```sh
python .claude/skills/writing-html-mocks/scripts/check_mocks.py docs/mocks --write   # regenerate gallery + coverage, then check
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks      # PNGs to docs/mocks/.cache (never commit)
```

The design system extracted from these mocks lives in [`docs/design-system/`](../design-system/README.md).
