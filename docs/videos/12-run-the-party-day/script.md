# 12 · Run the party day

On the day itself, a parent needs one page: what happens next, who to call, and who can't eat what. This video shows Giddy's party-day run sheet, and how it keeps working when the venue's basement has no signal.

## What the party day promises

Giddy drafts the day from the plan, from set-up to pick-up. Each step has a time, what happens, who looks after it, and the one thing not to forget, like the gluten-free slice for Hana. On the day, the current step says Now and moves on by itself, and finished steps say Done. Tapping Call opens the phone's dialler. And once the run sheet has been opened on a device in the week before the party, it works without a connection.

## The day itself

Here is Zuri's party on a phone, at twenty to two. Professor Fizz's Volcano Lab is on now: it's ringed and labelled Now, and set-up, the pizza delivery and the guests arriving are marked Done. When the show ends at a quarter past two, the run sheet moves on to food and drinks by itself, and the food step carries the allergy reminder. Below the timeline are quick calls for Bea, the Dino Den host, Professor Fizz and Pizza Nonna, and the allergy check lists every child with an allergy.

## Drafting the run sheet

A party without a run sheet offers to draft one. Giddy works the times out from the party's start and end, the length of the show, and what's been booked.

## Working offline

Here's the checklist on a laptop when the connection drops. A banner says the parent can keep ticking off tasks, and they'll sync later. Amara ticks off ordering the cake. When the connection returns, the change is sent, and a Back online banner says one checklist tick synced. Next, she ticks the RSVP reminder while offline, but Kemi changed that same task in the meantime. When Amara reconnects, Giddy doesn't overwrite Kemi's change. A banner says one change couldn't sync, and Review change shows both versions side by side. Amara keeps hers.

## Pages that aren't saved

The run sheet, contacts, allergy list and checklist are saved on the device. Any other page opened offline explains what still works and links straight to the saved run sheet.

## How it is tested

The API tests cover drafting the steps with times, who and the allergy reminder, quick calls and the allergy list, drafting only once and only with bookings, viewers who can only read, and ticks sent with the version the parent saw, including the conflict when a co-planner changed the task. The browser tests check Now and Done moving on with the clock, the dialler links, drafting, the run sheet and checklist loading from the device, syncing, resolving a conflict and the offline page, with accessibility checks at phone and desktop widths. A production build was also checked: with the service worker, a saved run sheet reloads with no connection at all.

## Recap

Things to remember. The run sheet is drafted from the plan, with who and what to remember at each step. Now and Done follow the clock. Calls go straight to the dialler. And offline, the day still works: ticks wait on the device and sync, and conflicts are shown, never overwritten. Next, signing up and setting up the family.
