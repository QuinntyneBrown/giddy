# Giddy mocks

Static HTML mocks for Giddy, the agentic birthday planner for kids in Toronto and the GTA. They cover every page, dialog and notification in every state. Open [index.html](index.html) straight from disk to browse them; no server or build step needed.

**Look and feel:** fun enough for kids, clear and calm for parents. The app uses a grape accent on a warm cream canvas, with "party pop" colours (sun, pink, mint, sky, orange) for tiles and avatars. Headings use rounded type, buttons are chunky and pressable, and confetti appears on hero panels. Giddy, the balloon mascot, stands in for the planning agent. Dark mode uses a night-sky palette. All of this lives in `assets/tokens.css` and `assets/ui.css`.

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
| Landing (`landing`) | [✅](pages/landing/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Sign in (`sign-in`) | [✅](pages/sign-in/default.html) | ➖ | ➖ | [✅](pages/sign-in/error.html) | [✅](pages/sign-in/invalid.html) | [✅](pages/sign-in/submitting.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Sign up (`sign-up`) | [✅](pages/sign-up/default.html) | ➖ | ➖ | [✅](pages/sign-up/error.html) | [✅](pages/sign-up/invalid.html) | [✅](pages/sign-up/submitting.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Forgot password (`forgot-password`) | [✅](pages/forgot-password/default.html) | ➖ | ➖ | [✅](pages/forgot-password/error.html) | [✅](pages/forgot-password/invalid.html) | [✅](pages/forgot-password/submitting.html) | [✅](pages/forgot-password/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Reset password (`reset-password`) | [✅](pages/reset-password/default.html) | ➖ | ➖ | [✅](pages/reset-password/error.html) | [✅](pages/reset-password/invalid.html) | [✅](pages/reset-password/submitting.html) | [✅](pages/reset-password/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Verify email (`verify-email`) | [✅](pages/verify-email/default.html) | ➖ | ➖ | [✅](pages/verify-email/error.html) |  |  | [✅](pages/verify-email/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Family setup (`onboarding`) | [✅](pages/onboarding/default.html) | ➖ | ➖ | [✅](pages/onboarding/error.html) | [✅](pages/onboarding/invalid.html) | [✅](pages/onboarding/submitting.html) | [✅](pages/onboarding/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Not found (404) (`not-found`) | [✅](pages/not-found/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| No access (403) (`forbidden`) | [✅](pages/forbidden/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Server error (500) (`server-error`) | [✅](pages/server-error/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Offline (`offline`) | [✅](pages/offline/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Help (`help`) | [✅](pages/help/default.html) | ➖ | ➖ | ➖ |  |  |  | [✅](pages/help/no-results.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Terms & privacy (`legal`) | [✅](pages/legal/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Home (`home`) | [✅](pages/home/default.html) | [✅](pages/home/loading.html) | [✅](pages/home/empty.html) | [✅](pages/home/error.html) |  |  |  |  | [✅](pages/home/partial.html) | [✅](pages/home/offline.html) |  |  |  |  |  |  |  |  |  |  |  |  |
| Ask Giddy (chat) (`planner-chat`) | [✅](pages/planner-chat/default.html) | [✅](pages/planner-chat/loading.html) | [✅](pages/planner-chat/empty.html) | [✅](pages/planner-chat/error.html) |  |  |  |  |  |  | [✅](pages/planner-chat/thinking.html) | [✅](pages/planner-chat/failed.html) |  |  |  |  |  |  |  |  |  |  |
| New party (`new-party`) | [✅](pages/new-party/default.html) | ➖ | ➖ | [✅](pages/new-party/error.html) | [✅](pages/new-party/invalid.html) | [✅](pages/new-party/submitting.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| My parties (`parties`) | [✅](pages/parties/default.html) | [✅](pages/parties/loading.html) | [✅](pages/parties/empty.html) | [✅](pages/parties/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Party overview (`party-overview`) | [✅](pages/party-overview/default.html) | [✅](pages/party-overview/loading.html) | [✅](pages/party-overview/empty.html) | [✅](pages/party-overview/error.html) |  |  |  |  | [✅](pages/party-overview/partial.html) |  |  |  | [✅](pages/party-overview/locked.html) |  |  |  |  |  |  |  |  |  |
| Themes (`themes`) | [✅](pages/themes/default.html) | [✅](pages/themes/loading.html) | ➖ | [✅](pages/themes/error.html) |  |  |  | [✅](pages/themes/no-results.html) |  |  |  |  |  | [✅](pages/themes/selected.html) |  |  |  |  |  |  |  |  |
| Venues (`venues`) | [✅](pages/venues/default.html) | [✅](pages/venues/loading.html) | ➖ | [✅](pages/venues/error.html) |  |  |  | [✅](pages/venues/no-results.html) |  |  |  |  |  |  | [✅](pages/venues/compare.html) |  |  |  |  |  |  |  |
| Venue detail (`venue-detail`) | [✅](pages/venue-detail/default.html) | [✅](pages/venue-detail/loading.html) | ➖ | [✅](pages/venue-detail/error.html) |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/venue-detail/unavailable.html) | [✅](pages/venue-detail/booked.html) |  |  |  |  |  |
| Compare venues (`compare-venues`) | [✅](pages/compare-venues/default.html) | [✅](pages/compare-venues/loading.html) | [✅](pages/compare-venues/empty.html) | [✅](pages/compare-venues/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Fun & food (`vendors`) | [✅](pages/vendors/default.html) | [✅](pages/vendors/loading.html) | ➖ | [✅](pages/vendors/error.html) |  |  |  | [✅](pages/vendors/no-results.html) |  |  |  |  |  |  |  |  |  | [✅](pages/vendors/food.html) |  |  |  |  |
| Budget (`budget`) | [✅](pages/budget/default.html) | [✅](pages/budget/loading.html) | [✅](pages/budget/empty.html) | [✅](pages/budget/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/budget/over-budget.html) |  |  |  |
| Guests (`guests`) | [✅](pages/guests/default.html) | [✅](pages/guests/loading.html) | [✅](pages/guests/empty.html) | [✅](pages/guests/error.html) |  |  |  | [✅](pages/guests/no-results.html) |  |  |  |  |  | [✅](pages/guests/selected.html) |  |  |  |  |  |  |  |  |
| Invitations (`invitation`) | [✅](pages/invitation/default.html) | [✅](pages/invitation/loading.html) | ➖ | [✅](pages/invitation/error.html) | [✅](pages/invitation/invalid.html) | [✅](pages/invitation/submitting.html) | [✅](pages/invitation/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| RSVP (guest view) (`rsvp`) | [✅](pages/rsvp/default.html) | [✅](pages/rsvp/loading.html) | ➖ | [✅](pages/rsvp/error.html) | [✅](pages/rsvp/invalid.html) | [✅](pages/rsvp/submitting.html) | [✅](pages/rsvp/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Checklist (`checklist`) | [✅](pages/checklist/default.html) | [✅](pages/checklist/loading.html) | [✅](pages/checklist/empty.html) | [✅](pages/checklist/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/checklist/all-done.html) |  |  |
| Party day run sheet (`run-sheet`) | [✅](pages/run-sheet/default.html) | [✅](pages/run-sheet/loading.html) | [✅](pages/run-sheet/empty.html) | [✅](pages/run-sheet/error.html) |  |  |  |  |  | [✅](pages/run-sheet/offline.html) |  |  |  |  |  |  |  |  |  |  |  |  |
| Wrap-up (`wrap-up`) | [✅](pages/wrap-up/default.html) | [✅](pages/wrap-up/loading.html) | [✅](pages/wrap-up/empty.html) | [✅](pages/wrap-up/error.html) |  |  | [✅](pages/wrap-up/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Notifications (`notifications`) | [✅](pages/notifications/default.html) | [✅](pages/notifications/loading.html) | [✅](pages/notifications/empty.html) | [✅](pages/notifications/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/notifications/read.html) |  |
| Settings (`settings`) | [✅](pages/settings/default.html) | [✅](pages/settings/loading.html) | ➖ | [✅](pages/settings/error.html) | [✅](pages/settings/invalid.html) | [✅](pages/settings/submitting.html) | [✅](pages/settings/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Family (`family`) | [✅](pages/family/default.html) | [✅](pages/family/loading.html) | [✅](pages/family/empty.html) | [✅](pages/family/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |

### Dialogs

| Screen | default | busy | invalid | failed | success | confirm | Requirements |
|---|---|---|---|---|---|---|---|
| Add a child (`add-child`) | [✅](dialogs/add-child/default.html) | [✅](dialogs/add-child/busy.html) | [✅](dialogs/add-child/invalid.html) | [✅](dialogs/add-child/failed.html) |  |  |  |
| Add a guest (`add-guest`) | [✅](dialogs/add-guest/default.html) | [✅](dialogs/add-guest/busy.html) | [✅](dialogs/add-guest/invalid.html) | [✅](dialogs/add-guest/failed.html) |  |  |  |
| Import guests (`import-guests`) | [✅](dialogs/import-guests/default.html) | [✅](dialogs/import-guests/busy.html) | [✅](dialogs/import-guests/invalid.html) | [✅](dialogs/import-guests/failed.html) | [✅](dialogs/import-guests/success.html) |  |  |
| Remove guest (`remove-guest`) | [✅](dialogs/remove-guest/default.html) | [✅](dialogs/remove-guest/busy.html) | ➖ | [✅](dialogs/remove-guest/failed.html) |  |  |  |
| Book a venue (`book-venue`) | [✅](dialogs/book-venue/default.html) | [✅](dialogs/book-venue/busy.html) | [✅](dialogs/book-venue/invalid.html) | [✅](dialogs/book-venue/failed.html) | [✅](dialogs/book-venue/success.html) |  |  |
| Request a quote (`request-quote`) | [✅](dialogs/request-quote/default.html) | [✅](dialogs/request-quote/busy.html) | [✅](dialogs/request-quote/invalid.html) | [✅](dialogs/request-quote/failed.html) | [✅](dialogs/request-quote/success.html) |  |  |
| Add a cost (`add-expense`) | [✅](dialogs/add-expense/default.html) | [✅](dialogs/add-expense/busy.html) | [✅](dialogs/add-expense/invalid.html) | [✅](dialogs/add-expense/failed.html) |  |  |  |
| Add a task (`add-task`) | [✅](dialogs/add-task/default.html) | [✅](dialogs/add-task/busy.html) | [✅](dialogs/add-task/invalid.html) | [✅](dialogs/add-task/failed.html) |  |  |  |
| Use Giddy’s plan (`accept-plan`) | [✅](dialogs/accept-plan/default.html) | [✅](dialogs/accept-plan/busy.html) | ➖ | [✅](dialogs/accept-plan/failed.html) |  |  |  |
| Share plan (`share-plan`) | [✅](dialogs/share-plan/default.html) | [✅](dialogs/share-plan/busy.html) | [✅](dialogs/share-plan/invalid.html) | [✅](dialogs/share-plan/failed.html) |  |  |  |
| Delete party (`delete-party`) | [✅](dialogs/delete-party/default.html) | [✅](dialogs/delete-party/busy.html) | [✅](dialogs/delete-party/invalid.html) | [✅](dialogs/delete-party/failed.html) |  | [✅](dialogs/delete-party/confirm.html) |  |
| Sign out (`sign-out`) | [✅](dialogs/sign-out/default.html) | [✅](dialogs/sign-out/busy.html) | ➖ |  |  |  |  |
| Session expired (`session-expired`) | [✅](dialogs/session-expired/default.html) | [✅](dialogs/session-expired/busy.html) | [✅](dialogs/session-expired/invalid.html) |  |  |  |  |

### Notifications

| Screen | info | success | warning | danger | with-action | stacked | persistent | Requirements |
|---|---|---|---|---|---|---|---|---|
| Action toast (`action-toast`) | [✅](notifications/action-toast/info.html) | [✅](notifications/action-toast/success.html) | [✅](notifications/action-toast/warning.html) | [✅](notifications/action-toast/danger.html) | [✅](notifications/action-toast/with-action.html) | [✅](notifications/action-toast/stacked.html) |  |  |
| Live RSVP update (`rsvp-toast`) | [✅](notifications/rsvp-toast/info.html) | [✅](notifications/rsvp-toast/success.html) | [✅](notifications/rsvp-toast/warning.html) | [✅](notifications/rsvp-toast/danger.html) |  |  |  |  |
| Booking status banner (`booking-banner`) | [✅](notifications/booking-banner/info.html) | [✅](notifications/booking-banner/success.html) | [✅](notifications/booking-banner/warning.html) | [✅](notifications/booking-banner/danger.html) |  |  | [✅](notifications/booking-banner/persistent.html) |  |
| Connection banner (`connection-banner`) | [✅](notifications/connection-banner/info.html) | [✅](notifications/connection-banner/success.html) | [✅](notifications/connection-banner/warning.html) | [✅](notifications/connection-banner/danger.html) |  |  |  |  |
| Verify email banner (`verify-banner`) | [✅](notifications/verify-banner/info.html) | [✅](notifications/verify-banner/success.html) | [✅](notifications/verify-banner/warning.html) | [✅](notifications/verify-banner/danger.html) |  |  | [✅](notifications/verify-banner/persistent.html) |  |
| Cookie consent (`cookie-consent`) | [✅](notifications/cookie-consent/info.html) | [✅](notifications/cookie-consent/success.html) | ➖ | ➖ |  |  |  |  |
| Push permission prompt (`push-prompt`) | [✅](notifications/push-prompt/info.html) | [✅](notifications/push-prompt/success.html) | [✅](notifications/push-prompt/warning.html) | ➖ |  |  |  |  |

<!-- coverage:end -->

## Open questions and assumptions

- **No specs yet.** These mocks come from the journey list and the one-line product description, so no requirement IDs are attached. Run `writing-requirements` next and add the L2 IDs to `manifest.json`.
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

Next step: run `extracting-design-systems` to turn these mocks into `docs/design-system/`.
