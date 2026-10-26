# 11 · Follow the checklist

> **Runtime:** ~3.5 min · **Audience:** contributors and product owners · **Prerequisites:** [10 · Manage the budget](../10-manage-the-budget/README.md)

**Video:** [11-follow-the-checklist.mp4](11-follow-the-checklist.mp4) · [Slides](slides.html) · **Audio:** [11-follow-the-checklist.mp3](11-follow-the-checklist.mp3) · [Transcript](script.md)

## Why this video exists

Journey 11 ([prompt](../../prompts/11-follow-the-checklist.md)) delivers the dated checklist, adding and assigning tasks, task reminders and quiet hours (L2-047 to L2-049 and L2-061).

## Learning objectives

By the end, the viewer can:

- explain how tasks are dated and grouped;
- tick, add, assign, edit and delete tasks;
- say which tasks Giddy can do and how it asks first;
- describe when reminders and digests are sent, and what quiet hours hold back.

## Key questions

| Question | What a strong answer includes |
|---|---|
| How are tasks grouped? | Overdue, This week (next seven days), Before the party and Done, for today in Toronto |
| How do co-planners stay in step? | A task party event; live updates every 3 s skip your own changes |
| What can Giddy do? | Share the allergy list with the venue and remind families who haven't replied, after confirming |
| When is a reminder sent? | 9:00 am Toronto the day before, once; overdue tasks in one digest; quiet hours 9 pm–7 am |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/Giddy.Domain/Parties/ChecklistGenerator.cs` | the dated tasks |
| `backend/src/Giddy.Application/Checklist/` | the checklist API and Giddy-done tasks |
| `backend/src/Giddy.Application/Checklist/Reminders/TaskReminders.cs` | reminders and the digest |
| `backend/src/Giddy.Domain/Notifications/QuietHours.cs` | quiet hours |
| `frontend/projects/checklist/` | the checklist page and dialogs |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:45 | Introduction, promises | What the checklist guarantees |
| 00:45-01:50 | Tasks | Ticking, Let Giddy do it, adding a task |
| 01:50-02:30 | Menu, together | Menu order; a co-planner's tick |
| 02:30-03:10 | Start, finish, reminders | Empty and all-done; reminders and quiet hours |
| 03:10-03:50 | Tests, recap | API and browser coverage |

## Demo commands

```sh
dotnet test backend/Giddy.slnx
cd frontend && npx playwright test checklist
```

## Pitfalls

- Reminders go by email for now; push and text arrive with the notifications journey.
- "Open the run sheet" leads to the party-day page, built in the next journey.

## References

- [WAI-ARIA: menu button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)
- [Angular CDK Menu](https://material.angular.dev/cdk/menu/overview)
