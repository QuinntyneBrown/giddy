# Giddy design system

Extracted from [docs/mocks](../mocks/README.md) on Sun 25 Oct 2026. Open [index.html](index.html) locally (no server needed); press `t` to toggle dark mode.

Giddy is fun for kids and clear for parents. It uses a grape accent on a warm cream canvas, “party pop” colours (sun, pink, mint, sky, orange, grape) for tiles and avatars, rounded type, pill-shaped pressable buttons, confetti heroes and Giddy the balloon mascot. Dark mode uses a night-sky palette.

## Foundations

| Page | Covers |
|---|---|
| [Color](foundations/color.html) | Grape, cream, night sky and party pops |
| [Typography](foundations/typography.html) | Rounded display and body |
| [Spacing](foundations/spacing.html) | 4px scale |
| [Layout](foundations/layout.html) | 4/8/12 grid, shell |
| [Elevation](foundations/elevation.html) | Shadows, press lip, z-order |
| [Shape](foundations/shape.html) | Pills and soft corners |
| [Motion](foundations/motion.html) | Durations, easings, reduced motion |
| [Iconography](foundations/iconography.html) | Icons, emoji art, mascot |
| [Theming](foundations/theming.html) | Light, dark, new themes |
| [Responsive](foundations/responsive.html) | Phone-first rules |
| [Accessibility](foundations/accessibility.html) | WCAG 2.2 AA commitments |
| [Content](foundations/content.html) | Voice, formulas, microcopy |

## Components (49)

Every page has the same 13 sections: overview, anatomy, variants, sizes, states (matrix plus both themes), responsive, theming, accessibility, content, do and don't, tokens, code and sources.

| Component | Group | Source mocks |
|---|---|---|
| [Button](components/button.html) | Actions | [pages/home/default](../mocks/pages/home/default.html), [pages/venue-detail/default](../mocks/pages/venue-detail/default.html), [dialogs/delete-party/confirm](../mocks/dialogs/delete-party/confirm.html) |
| [Link](components/link.html) | Actions | [pages/landing/default](../mocks/pages/landing/default.html), [pages/sign-in/default](../mocks/pages/sign-in/default.html), [pages/run-sheet/default](../mocks/pages/run-sheet/default.html) |
| [Menu](components/menu.html) | Actions | [pages/checklist/default](../mocks/pages/checklist/default.html) |
| [Text field](components/text-field.html) | Inputs | [dialogs/add-guest/invalid](../mocks/dialogs/add-guest/invalid.html), [pages/new-party/default](../mocks/pages/new-party/default.html), [pages/settings/invalid](../mocks/pages/settings/invalid.html) |
| [Textarea](components/textarea.html) | Inputs | [pages/invitation/default](../mocks/pages/invitation/default.html), [pages/rsvp/default](../mocks/pages/rsvp/default.html), [dialogs/book-venue/default](../mocks/dialogs/book-venue/default.html) |
| [Select](components/select.html) | Inputs | [pages/venues/default](../mocks/pages/venues/default.html), [dialogs/add-task/default](../mocks/dialogs/add-task/default.html) |
| [Checkbox](components/checkbox.html) | Inputs | [pages/invitation/default](../mocks/pages/invitation/default.html), [pages/checklist/default](../mocks/pages/checklist/default.html), [pages/guests/selected](../mocks/pages/guests/selected.html) |
| [Radio group](components/radio-group.html) | Inputs | [pages/rsvp/default](../mocks/pages/rsvp/default.html), [dialogs/import-guests/default](../mocks/dialogs/import-guests/default.html), [dialogs/share-plan/default](../mocks/dialogs/share-plan/default.html) |
| [Choice card](components/choice-card.html) | Inputs | [pages/onboarding/default](../mocks/pages/onboarding/default.html), [pages/new-party/default](../mocks/pages/new-party/default.html), [pages/rsvp/default](../mocks/pages/rsvp/default.html) |
| [Switch](components/switch.html) | Inputs | [pages/settings/default](../mocks/pages/settings/default.html) |
| [File upload](components/file-upload.html) | Inputs | [dialogs/import-guests/default](../mocks/dialogs/import-guests/default.html), [dialogs/import-guests/busy](../mocks/dialogs/import-guests/busy.html), [dialogs/import-guests/invalid](../mocks/dialogs/import-guests/invalid.html) |
| [Form field](components/form-field.html) | Inputs | [pages/settings/invalid](../mocks/pages/settings/invalid.html), [pages/rsvp/invalid](../mocks/pages/rsvp/invalid.html) |
| [Form layout](components/form-layout.html) | Inputs | [pages/sign-up/invalid](../mocks/pages/sign-up/invalid.html), [pages/settings/submitting](../mocks/pages/settings/submitting.html), [pages/onboarding/default](../mocks/pages/onboarding/default.html) |
| [Top bar](components/top-bar.html) | Navigation | [pages/home/default](../mocks/pages/home/default.html), [pages/landing/default](../mocks/pages/landing/default.html) |
| [Sidebar navigation](components/sidebar-nav.html) | Navigation | [pages/home/default](../mocks/pages/home/default.html), [pages/notifications/default](../mocks/pages/notifications/default.html) |
| [Bottom navigation](components/bottom-nav.html) | Navigation | [pages/home/default](../mocks/pages/home/default.html), [pages/planner-chat/default](../mocks/pages/planner-chat/default.html) |
| [Tabs](components/tabs.html) | Navigation | [pages/party-overview/default](../mocks/pages/party-overview/default.html), [pages/themes/default](../mocks/pages/themes/default.html) |
| [Breadcrumb](components/breadcrumb.html) | Navigation | [pages/guests/default](../mocks/pages/guests/default.html), [pages/venue-detail/default](../mocks/pages/venue-detail/default.html) |
| [Pagination](components/pagination.html) | Navigation | [pages/venues/default](../mocks/pages/venues/default.html) |
| [Stepper](components/stepper.html) | Navigation | [pages/onboarding/default](../mocks/pages/onboarding/default.html), [pages/new-party/default](../mocks/pages/new-party/default.html) |
| [Footer](components/footer.html) | Navigation | [pages/landing/default](../mocks/pages/landing/default.html), [pages/rsvp/default](../mocks/pages/rsvp/default.html) |
| [Skip link](components/skip-link.html) | Navigation | [pages/home/default](../mocks/pages/home/default.html) |
| [Card](components/card.html) | Containers | [pages/home/default](../mocks/pages/home/default.html), [pages/parties/default](../mocks/pages/parties/default.html) |
| [Accordion](components/accordion.html) | Containers | [pages/help/default](../mocks/pages/help/default.html) |
| [Dialog](components/dialog.html) | Containers | [dialogs/book-venue/default](../mocks/dialogs/book-venue/default.html), [dialogs/delete-party/confirm](../mocks/dialogs/delete-party/confirm.html), [dialogs/add-guest/invalid](../mocks/dialogs/add-guest/invalid.html) |
| [Tooltip](components/tooltip.html) | Containers | [pages/home/default](../mocks/pages/home/default.html) |
| [Divider](components/divider.html) | Containers | [pages/sign-in/default](../mocks/pages/sign-in/default.html), [pages/home/default](../mocks/pages/home/default.html) |
| [Layout primitives](components/layout.html) | Containers | [pages/home/default](../mocks/pages/home/default.html), [pages/themes/default](../mocks/pages/themes/default.html) |
| [Table](components/table.html) | Data display | [pages/guests/default](../mocks/pages/guests/default.html), [pages/budget/default](../mocks/pages/budget/default.html), [pages/compare-venues/default](../mocks/pages/compare-venues/default.html) |
| [List](components/list.html) | Data display | [pages/home/default](../mocks/pages/home/default.html), [pages/party-overview/default](../mocks/pages/party-overview/default.html) |
| [Description list](components/description-list.html) | Data display | [pages/planner-chat/default](../mocks/pages/planner-chat/default.html), [pages/venue-detail/booked](../mocks/pages/venue-detail/booked.html) |
| [Avatar](components/avatar.html) | Data display | [pages/guests/default](../mocks/pages/guests/default.html), [pages/family/default](../mocks/pages/family/default.html) |
| [Badge](components/badge.html) | Data display | [pages/guests/default](../mocks/pages/guests/default.html), [pages/party-overview/default](../mocks/pages/party-overview/default.html) |
| [Chip](components/chip.html) | Data display | [pages/themes/default](../mocks/pages/themes/default.html), [pages/planner-chat/default](../mocks/pages/planner-chat/default.html), [pages/settings/default](../mocks/pages/settings/default.html) |
| [Stat](components/stat.html) | Data display | [pages/budget/default](../mocks/pages/budget/default.html) |
| [Timeline](components/timeline.html) | Data display | [pages/run-sheet/default](../mocks/pages/run-sheet/default.html) |
| [Tile](components/tile.html) | Data display | [pages/themes/default](../mocks/pages/themes/default.html), [pages/venues/default](../mocks/pages/venues/default.html), [pages/vendors/food](../mocks/pages/vendors/food.html) |
| [Toast](components/toast.html) | Feedback | [notifications/action-toast/success](../mocks/notifications/action-toast/success.html), [notifications/action-toast/stacked](../mocks/notifications/action-toast/stacked.html), [notifications/rsvp-toast/success](../mocks/notifications/rsvp-toast/success.html) |
| [Alert & banner](components/alert.html) | Feedback | [notifications/booking-banner/danger](../mocks/notifications/booking-banner/danger.html), [notifications/connection-banner/warning](../mocks/notifications/connection-banner/warning.html), [pages/budget/over-budget](../mocks/pages/budget/over-budget.html) |
| [Inline message](components/inline-message.html) | Feedback | [pages/planner-chat/default](../mocks/pages/planner-chat/default.html), [notifications/connection-banner/info](../mocks/notifications/connection-banner/info.html) |
| [Progress](components/progress.html) | Feedback | [pages/checklist/default](../mocks/pages/checklist/default.html), [dialogs/import-guests/busy](../mocks/dialogs/import-guests/busy.html), [pages/home/default](../mocks/pages/home/default.html) |
| [Spinner](components/spinner.html) | Feedback | [pages/planner-chat/thinking](../mocks/pages/planner-chat/thinking.html), [pages/sign-in/submitting](../mocks/pages/sign-in/submitting.html) |
| [Skeleton](components/skeleton.html) | Feedback | [pages/home/loading](../mocks/pages/home/loading.html), [pages/guests/loading](../mocks/pages/guests/loading.html) |
| [Empty state](components/empty-state.html) | Feedback | [pages/parties/empty](../mocks/pages/parties/empty.html), [pages/venues/no-results](../mocks/pages/venues/no-results.html), [pages/guests/no-results](../mocks/pages/guests/no-results.html) |
| [Error page](components/error-page.html) | Feedback | [pages/home/error](../mocks/pages/home/error.html), [pages/not-found/default](../mocks/pages/not-found/default.html), [pages/server-error/default](../mocks/pages/server-error/default.html) |
| [Chat](components/chat.html) | Giddy | [pages/planner-chat/default](../mocks/pages/planner-chat/default.html), [pages/planner-chat/thinking](../mocks/pages/planner-chat/thinking.html), [pages/planner-chat/failed](../mocks/pages/planner-chat/failed.html) |
| [Hero & party card](components/hero.html) | Giddy | [pages/home/default](../mocks/pages/home/default.html), [pages/landing/default](../mocks/pages/landing/default.html), [pages/checklist/all-done](../mocks/pages/checklist/all-done.html) |
| [Budget meter](components/meter.html) | Giddy | [pages/budget/default](../mocks/pages/budget/default.html), [pages/budget/over-budget](../mocks/pages/budget/over-budget.html) |
| [Mascot & logo](components/mascot.html) | Giddy | [pages/landing/default](../mocks/pages/landing/default.html), [pages/not-found/default](../mocks/pages/not-found/default.html), [pages/home/error](../mocks/pages/home/error.html) |

## Patterns

| Pattern | Covers |
|---|---|
| [Forms](patterns/forms.html) | Layout, validation, submit states |
| [Feedback & loading](patterns/feedback.html) | Which feedback for which wait or result |
| [Empty & error states](patterns/empty-and-error.html) | Copy formulas and mascot moods |
| [Navigation & page structure](patterns/navigation.html) | Shell, page header, tabs, breadcrumbs |
| [Dialogs & overlays](patterns/dialogs.html) | Dialog vs menu vs page; agent confirmations |
| [Data tables & lists](patterns/tables-and-lists.html) | Tables vs lists vs tiles, selection |
| [Notifications](patterns/notifications.html) | Toasts, banners, centre, permission |
| [Content & tone](patterns/content-and-tone.html) | Voice applied |
| [Talking with Giddy](patterns/agent-conversation.html) | How the planning agent shows work, proposes and asks |

## Tokens

- `tokens/tokens.css`: the source of truth (primitives, semantic tokens, light and dark themes, reduced motion, high contrast).
- `tokens/tokens.json`: DTCG export generated by `tokens_to_json.py`. Don't edit it by hand.
- `tokens/contrast-pairs.json`: 67 foreground/background pairs, all passing in both themes.
- `assets/components.css`: component styles, driven only by tokens. The mocks link it directly.

Giddy additions to the standard token set:
- `--palette-grape/cream/night/sun/pink/mint/sky/orange-*`
- `--color-pop-*` and `--color-hero-*`
- `--color-accent-press` and `--shadow-press`
- `--font-family-display` and `--font-weight-heavy`
- `--duration-spin` and `--duration-loop`
- `--size-illustration-*`
- `--layout-bottom-nav-height` and `--layout-aside-width`

## Drift found in the mocks

| Mock | Issue | Resolution |
|---|---|---|
| pages/home/default | Hero ring percentage invisible (white on white) | Hero ring variant uses on-hero colours |
| pages/home/default | Hero gradient end pink-400 gave white text 2.6:1 | Gradient end moved to pink-700 (5.8:1); dark uses pink-800 |
| pages/budget/over-budget | Alert actions overflowed at 360px | `.alert__actions` wrap; `.alert__body` can shrink |
| pages/guests/default | Table squeezed beside an aside at 1280px | Tally and allergy list moved above the table |
| dialogs/* | Page scrolled behind open dialogs | `body:has(> .dialog)` locks scroll |
| assets/ui.css `.bottom-nav__cta` | `!important` widths | More specific selector, `--target-comfortable` |
| app shell | Fixed bottom bar covered a footer placed after `main` on phones | `.has-bottom-nav .footer` clears the bar; `main` keeps normal spacing before it |
| assets/ui.css `.menu__item` | Focus shown by background only, outline removed | Inset focus ring restored |
| assets/ui.css loops | Raw 0.8s/1.2s/1.4s/1.6s animation durations | `--duration-spin` (800 ms), `--duration-loop` (1.4 s); typing dots and pulse snapped to 1.4 s |
| assets/ui.css `.badge` | Raw `0.02em` letter-spacing | Uses `--letter-spacing-wide` from the overline role |
| assets/ui.css `.tab::after` | Raw `2px` radius | `--radius-xs` |
| assets/ui.css `.media`, `.invite__emoji`, `.mascot` | Raw 4rem/6rem/10rem sizes | `--size-illustration-*` |
| assets/ui.css `.split` | Raw `22rem` aside | `--layout-aside-width` |
| assets/ui.css `.badge` | Off-grid 22px height | Kept as component token `--badge-height` (one caption line + 2px) |
| assets/ui.css `.timeline::before` | Magic `4.25rem` offset | Documented as derived from the 3.5rem time column + gap |
| pages/settings/default | Switch inside a form that has a Save button | Documented as a don't on the switch page |
| tokens.css (starter structure) | A `[data-theme="light"]` region inside a dark page kept dark values; component tokens resolved once on `:root` | Light block also matches `[data-theme="light"]`; component tokens and `--shadow-press`/focus aliases re-declared per theme |
| many pages | One-off inline `style` for layout (padding, widths) | Allowed by mock conventions; recurring ones should become classes when the Angular components are built |

## Verification

- `check_contrast.py tokens/tokens.css`: 134 checks (light and dark), 0 failed.
- `check_design_system.py docs/design-system`: 0 errors.
- `check_mocks.py docs/mocks` after pointing the mocks at this system: 0 errors.
- Screenshots of the index, color, button, dialog and chat pages at 360 and 1280px in both themes were reviewed.
