# 10 · Manage the budget

> **Runtime:** ~3 min · **Audience:** contributors and product owners · **Prerequisites:** [09 · Choose a theme](../09-choose-a-theme/README.md)

**Video:** [10-manage-the-budget.mp4](10-manage-the-budget.mp4) · [Slides](slides.html) · **Audio:** [10-manage-the-budget.mp3](10-manage-the-budget.mp3) · [Transcript](script.md)

## Why this video exists

Journey 10 ([prompt](../../prompts/10-manage-the-budget.md)) delivers budget tracking, adding and changing costs, and getting back within budget (L2-035 to L2-037).

## Learning objectives

By the end, the viewer can:

- read the budget's totals, legend and statuses;
- add, change and remove a cost, and read the "left after this" preview;
- say why quotes and deposits need no editing;
- apply one of Giddy's swaps when the plan goes over.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Where do the plan's statuses come from? | Quotes and bookings: Quoted, Booked, Deposit paid, Paid; the budget is read from the plan |
| Which costs can the parent edit? | Their own; Giddy's items change through vendors |
| What is a valid amount? | Positive, at most two decimals: "Enter an amount like 35 or 35.50" |
| How is a swap chosen? | The smallest single cheaper swap, free on the date and nearby, that is enough; otherwise the biggest savings first |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/Giddy.Application/Budget/BudgetProjection.cs` | lines, totals and statuses from the plan |
| `backend/src/Giddy.Application/Budget/SwapAdvisor.cs` | choosing swaps |
| `backend/src/Giddy.Api/Endpoints/BudgetEndpoints.cs` | the budget API |
| `frontend/projects/budget/` | the budget page and dialogs |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:40 | Introduction, promises | What the budget guarantees |
| 00:40-01:40 | Tracking | Totals, legend, statuses, adding and changing a cost |
| 01:40-02:05 | Empty and invalid | Fill in from the plan; the amount rule |
| 02:05-02:45 | Over budget | Warning, swap, back within budget |
| 02:45-03:20 | Tests, recap | API and browser coverage |

## Demo commands

```sh
dotnet test backend/Giddy.slnx
cd frontend && npx playwright test budget
```

## Pitfalls

- The table's Edit is only on the parent's own costs; plan items change through quotes and bookings.
- Swaps come from the catalogue: an item that is already booked is never swapped.

## References

- [WCAG 2.2: use of colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- [WCAG 2.2: error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
