# 11 · Follow the checklist

A party has a lot of small jobs, and most of them have a deadline. This video shows Giddy's dated checklist: how it groups what's due, how planners share the work, which tasks Giddy can do itself, and how reminders arrive without waking anyone up.

## What the checklist promises

Tasks are dated working back from the party: the cake and loot bags ten days before, the food two days before, and the party-day kit the day before. They're grouped into Overdue, This week, Before the party and Done, with a progress bar. A late task says Overdue in words, not just in red. Anything Giddy can do is labelled, and Giddy always asks before it sends anything. And when one planner ticks a task, the others see it within five seconds.

## Ticking and adding tasks

Here is Zuri's checklist on a laptop. Three of ten tasks are done and one is overdue: booking the entertainer was due on the twentieth. Amara ticks off ordering the cake, and it moves to Done as the progress bar fills. The RSVP reminder is labelled Giddy can do this. From its menu, she chooses Let Giddy do it. Giddy says exactly what it will send, and only after she confirms does it remind the three families who haven't replied and tick the task off. Then she adds a task of her own: buy a number seven candle and a lighter, due two days before the party, for Kemi, with a reminder the day before. It slots into the list in date order.

## The task menu

Each task's menu offers Edit, Let Giddy do it where it can, and Delete, last, after a divider. Deleting asks first.

## Planning together

On a phone, Amara has the checklist open when Kemi ticks off the cake on her own phone. Within a few seconds a toast says so, and the task moves to Done. Kemi doesn't get a toast about her own tick.

## Starting and finishing

A party without a checklist offers to make one in a tap, or to add a task by hand. And when every task is done, Giddy celebrates and points to the run sheet for the day itself.

## Reminders and quiet hours

Every morning at nine, Toronto time, the owner of each task due tomorrow gets a reminder, if they asked for one. Anyone with overdue tasks gets one message listing them all, not one per task. Giddy keeps quiet from nine at night to seven in the morning: anything that falls in those hours waits until seven, unless it's urgent on the party day itself, like a vendor cancelling.

## How it is tested

The API tests cover the dates and groups, ticking with readiness and the live update for other planners, adding, editing and deleting, the rules for a title, a date by the party and an owner who's planning, making a checklist, Giddy sharing the allergy list, viewers who can only look, reminders at nine sent once, the overdue digest, and quiet hours. The browser tests drive the same flows against the fake API, with accessibility checks with the menu and dialog open at phone and desktop widths.

## Recap

Things to remember. Tasks are dated back from the party and grouped by when they're due. Giddy can do some tasks, but always asks first. Planners see each other's ticks within seconds. Reminders come at nine and respect quiet hours. Next, the party day itself.
