# 12 · Run the party day

> **Runtime:** ~3.5 min · **Audience:** contributors and product owners · **Prerequisites:** [11 · Follow the checklist](../11-follow-the-checklist/README.md)

**Video:** [12-run-the-party-day.mp4](12-run-the-party-day.mp4) · [Slides](slides.html) · **Audio:** [12-run-the-party-day.mp3](12-run-the-party-day.mp3) · [Transcript](script.md)

## Why this video exists

Journey 12 ([prompt](../../prompts/12-run-the-party-day.md)) delivers the party-day run sheet and making it work offline (L2-050 and L2-051).

## Learning objectives

By the end, the viewer can:

- explain how the run sheet is drafted and what each step carries;
- say how the current step is chosen and when it moves on;
- describe what is saved on the device and how offline ticks sync;
- explain how a conflict with a co-planner's change is shown and resolved.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Where do the steps come from? | The plan: venue, food, entertainer and its show length, cake, loot bags, with allergy reminders from the guest list |
| How does Now move? | Worked out every 30 s from Toronto time; the last step that has started |
| What works offline? | Run sheet, quick calls, allergy list and checklist, saved in IndexedDB for 7 days; the app shell via the service worker |
| What happens to an offline tick on a changed task? | Sent with If-Match; 412 returns the current task; the parent keeps theirs or the co-planner's |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/Giddy.Application/RunSheets/RunSheetDrafter.cs` | the drafted day |
| `backend/src/Giddy.Application/Checklist/View/TaskVersion.cs` | versions for If-Match |
| `frontend/projects/core/src/lib/offline/` | OfflineStore, OfflineCache, TaskSync |
| `frontend/projects/party-day/` | the run sheet page |
| `frontend/ngsw-config.json` | the cached app shell |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:45 | Introduction, promises | What the party day guarantees |
| 00:45-01:30 | The day | Now and Done, quick calls, allergy check |
| 01:30-02:30 | Drafting, offline | Empty state; ticks sync; a conflict |
| 02:30-03:00 | Not saved | The offline page |
| 03:00-03:40 | Tests, recap | API, browser and production checks |

## Demo commands

```sh
dotnet test backend/Giddy.slnx
cd frontend && npx playwright test party-day
```

## Pitfalls

- The service worker runs only in production builds; `ng serve` and the e2e suite rely on the device copy alone.
- Run sheet steps are drafted once; editing steps is not part of this journey.

## References

- [Angular service worker](https://angular.dev/ecosystem/service-workers)
- [MDN: If-Match](https://developer.mozilla.org/docs/Web/HTTP/Headers/If-Match)
