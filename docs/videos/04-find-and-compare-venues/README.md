# 04 · Find and compare venues

> **Runtime:** ~4 min · **Audience:** contributors and product owners · **Prerequisites:** [03 · Start a party plan](../03-start-a-party-plan/README.md)

**Video:** [04-find-and-compare-venues.mp4](04-find-and-compare-venues.mp4) · [Slides](slides.html) · **Audio:** [04-find-and-compare-venues.mp3](04-find-and-compare-venues.mp3) · [Transcript](script.md)

## Why this video exists

Journey 04 ([prompt](../../prompts/04-find-and-compare-venues.md)) delivers venue search, venue pages and comparisons (L2-025 to L2-027, L2-090).

## Learning objectives

By the end, the viewer can:

- explain which venues appear for a party and why;
- describe the filters, sorts, close-fit warning and the empty-result relaxation;
- describe a venue's slots, favourites and the fully booked alternatives;
- explain how a comparison marks the best values and picks a venue.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Which venues are listed? | Free on the date for at least one slot, within the distance and service radius, fitting the kids (up to two short with a warning) |
| What happens with no results? | The conflicting filters are named and one relaxation that returns results is offered |
| What if availability times out? | HTTP 503; the page explains it and keeps the filters |
| How is the best value shown? | The word "Best" beside the value, as well as green |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/Giddy.Application/Venues/Search/` | candidates, filters, sort and `RelaxationAdvisor` |
| `backend/src/Giddy.Application/Venues/Detail/GetVenueHandler.cs` | slots, nearest free date, similar venue |
| `backend/src/Giddy.Application/Venues/Compare/CompareVenuesHandler.cs` | best per row and the pick |
| `frontend/projects/venues/` | Venues, venue page, compare page |
| `tools/video-record/e2e-fake-api.mjs` | recordings use the e2e fake API |
| `clips/*.mp4`, `shots/*.png` | search, empty results, a venue on a phone, comparison, timeouts and outside the GTA |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:30 | Introduction, promises | What search guarantees |
| 00:30-01:15 | Searching and narrowing | Pre-filled filters, cards, close fit, filter, sort |
| 01:15-01:45 | When nothing matches | Relaxation, timeout, outside the GTA |
| 01:45-02:30 | A venue's page | Details, favourite, slots, fully booked |
| 02:30-03:10 | Comparing venues | The bar, the table, Best, Giddy's pick |
| 03:10-03:50 | Tests, recap | API and browser coverage |

## Demo commands

```sh
dotnet test backend/Giddy.slnx
cd frontend && npx playwright test venues
```

## Pitfalls

- Availability comes from the slots venues share with Giddy; partner APIs plug in behind `IVenueAvailability`.
- Booking a slot and paying the deposit arrive in journey 05.

## References

- [WAI-ARIA toggle button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [WCAG 2.2: use of colour](https://www.w3.org/TR/WCAG22/#use-of-color)
