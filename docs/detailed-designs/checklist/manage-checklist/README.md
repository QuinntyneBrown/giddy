# Manage the party checklist

## Overview

Each party has a *checklist*: dated tasks generated backwards from the party date, grouped into Overdue, This week, Before the party and Done. Parents tick tasks, add their own, assign them to co-planners and let Giddy do eligible tasks after confirmation.

- **task** — dated to-do with an owner, a done flag and an optional Giddy action
- **Giddy action** — task Giddy can carry out (send the allergy list, send a reminder) after the parent confirms

This feature belongs to the **Checklist and reminders** subsystem. It is designed from the screens in [`docs/mocks`](../../../mocks/README.md) and the L2 requirements listed below.

## Description

The feature is a vertical slice from the Angular web application through the Giddy API to storage and any external services.

**Frontend (Giddy Web)**

- **`ChecklistPage`** — Route `/parties/{id}/checklist`; groups, progress bar, task menus.
- **`AddTaskDialog`** — Title, due date, owner, remind-me.

**Backend (Giddy API)**

- **`TasksController`** — `GET/POST/PUT/DELETE /api/parties/{id}/tasks`, `POST .../tasks/{taskId}/complete`.
- **`ChecklistGenerator`** — Creates tasks with offsets (cake 10 days before, food 2 days before, kit 1 day before).
- **`PartyTask`** — Entity with `Group(today)` and `IsOverdue(today)`.
- **`CompleteTaskHandler`** — Marks done, updates readiness, pushes the change to co-planners within 5 s.


## Requirements

The feature realizes the following level-2 (L2) requirements. Each L2 requirement refines the level-1 (L1) requirement cited beside it; the full acceptance criteria are in [`docs/specs/L2.md`](../../../specs/L2.md).

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-047` | `L1-012` | **Party checklist.** Given a party with a plan, when the checklist is generated, then tasks are dated working back from the party date (for example confirm entertainer, order cake 10 days before, buy loot bags, order food 2 days before, pack the party-day kit the day before) and grouped into Overdue, This week, Before the party and Done, with a progress bar. |
| `L2-048` | `L1-012` | **Add and assign tasks.** Given the checklist, when the parent adds a task with a title, due date, owner (themselves or a co-planner) and "remind me the day before", then it appears in date order. |

## Diagrams

### System context

Only parents, co-planners and Giddy take part.

![C4 system context: Manage the party checklist](diagrams/c4-context.png)

### Containers

Task changes are pushed to every open page of the party.

![C4 container view: Manage the party checklist](diagrams/c4-container.png)

### Components

Generation, completion and push are separate responsibilities.

![C4 component view: Manage the party checklist](diagrams/c4-component.png)

### Class structure

`PartyTask.Group` derives the group from the due date and today.

![Class diagram: Manage the party checklist](diagrams/class-structure.png)

### Behaviour — tick a task

Completing a task updates readiness and reaches co-planners within 5 seconds (`L2-047`).

![Sequence diagram: Checklist — tick a task](diagrams/sequence-complete.png)
