# Rate vendors and reuse the plan

## Overview

Parents rate the venue and vendors they actually booked, see final numbers, and save the plan as a *template* for next year, which also schedules a reminder about eight weeks before the child's next birthday.

- **template** — copy of a party's theme, vendors and checklist used to start a new draft

This feature belongs to the **Wrap-up** subsystem. It is designed from the screens in [`docs/mocks`](../../../mocks/README.md) and the L2 requirements listed below.

## Description

The feature is a vertical slice from the Angular web application through the Giddy API to storage and any external services.

**Frontend (Giddy Web)**

- **`RatingStars`** — 1–5 star buttons with `aria-pressed`.
- **`FinalNumbersCard`** — Kids, spend, gifts.
- **`SaveTemplateButton`** — Saves the template.

**Backend (Giddy API)**

- **`RatingsController`** — `PUT /api/parties/{id}/ratings/{providerId}`; only providers with a confirmed booking or accepted quote.
- **`SaveTemplateHandler`** — Copies the plan into a `PartyTemplate` and schedules a reminder.


**As built**

**Ratings**
- `PUT /api/parties/{id}/ratings/{providerId}` takes 1 to 5 stars and an optional review of up to 500 characters.
- Only businesses in the plan with a confirmed booking or accepted quote can be rated; anything else is 404.
- The first rating counts in the catalogue item's public rating and review count. Changing it replaces that party's earlier stars.
- On the page, `giddy-star-rating` is a group of toggle buttons. "Add a review" opens `ReviewDialog`.

**Final numbers**
- Final numbers come from the same endpoint: kids who came of those invited, everything in the budget against the budget, and gifts logged.

**Saving the plan**
- `POST /api/parties/{id}/template` saves the theme, the venue and vendors (to book again at their last prices) and the checklist with each task's days before the party (`PartyTemplate`). Saving again returns the same plan.
- The reminder date is eight weeks before the first birthday after the one celebrated that is still at least eight weeks away.
- `TemplateReminders` runs in the reminder worker from 9 am and sends "Plan Zuri’s 8th from last year’s party?" once, linking to `/parties/new?template={id}`.

**Starting from the plan**
- A new party started from the plan (`POST /api/parties` with `templateId`, owner only) takes it over with the checklist re-dated.
- "Reuse this plan" on a past party's overview saves the plan and opens the new-party form from it.
- Deleting the account removes saved plans, notes and ratings.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each L2 requirement refines the level-1 (L1) requirement cited beside it; the full acceptance criteria are in [`docs/specs/L2.md`](../../../specs/L2.md).

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-053` | `L1-014` | **Rate venue and vendors.** Given wrap-up, when the parent rates a booked venue or vendor from 1 to 5 stars, then the rating is saved and counted in that business's public rating; a review text is optional. |
| `L2-054` | `L1-014` | **Final numbers and reuse.** Given wrap-up, when it is shown, then it lists how many kids came, the final spend against budget and the number of gifts logged. |

## Diagrams

### System context

Only parents and Giddy take part.

![C4 system context: Rate vendors and reuse the plan](diagrams/c4-context.png)

### Containers

A standard slice.

![C4 container view: Rate vendors and reuse the plan](diagrams/c4-container.png)

### Components

Rating and templating are separate handlers.

![C4 component view: Rate vendors and reuse the plan](diagrams/c4-component.png)

### Class structure

Ratings link a party to a provider.

![Class diagram: Rate vendors and reuse the plan](diagrams/class-structure.png)

### Behaviour — rate a booked venue

Ratings are accepted only for providers with a confirmed booking or accepted quote (`L2-053`).

![Sequence diagram: Wrap-up — rate a booked venue](diagrams/sequence-rate.png)
