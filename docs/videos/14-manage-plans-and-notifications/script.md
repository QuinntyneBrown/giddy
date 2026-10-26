# 14 · Manage plans and notifications

A birthday party is rarely planned alone, and the news that matters arrives while you're doing something else. This video shows sharing a plan, the notification centre, how Giddy delivers messages, and the settings that put a parent in charge of all of it, including their data.

## Planning together

Here's Amara sharing Zuri's party. She invites her partner to edit everything, and Grandma Ngozi to view only. Each gets an email with a private link, and once they join, Amara gets a note in her notifications. Under the invitations, Copy link makes a view-only link for anyone else. It shows a summary of the party without any guest's details, and making a new link switches the old one off. When a co-planner changes the budget, books a vendor or sends the invitations, the other planners hear about it.

## The notification centre

Everything Giddy tells a parent also lands in the notification centre, split into new and earlier, with a link to the thing it's about. The bell in the top bar says how many are unread, and the count updates live. Toasts last eight seconds, twelve for a warning, and pause while you point at them. A danger toast stays until it's dismissed, and no more than three show at once.

## How messages arrive

Each kind of message, RSVPs, vendor quotes and bookings, Giddy's reminders and party ideas, goes by the channels the parent chose: email, text or push. Quiet hours hold anything that isn't urgent between nine at night and seven in the morning. Every text ends with Reply STOP to opt out, and a STOP reply turns texts off for that number straight away. Marketing emails carry an unsubscribe link that works without signing in.

## Settings

In Settings, Amara updates her mobile number, turns off reminder emails, and saves both with one button. Then she switches off quiet hours, which takes effect immediately, with no save needed. A mobile number that's too short, or a postal code that isn't Canadian, gets an inline error and nothing is saved. Changing the email sends a link to the new address, and the old one keeps working until that link is opened.

## Push and cookies

Giddy asks about push notifications only after the first invitations go out, and it explains what they're for before the browser asks. Not now keeps the question away for thirty days. If the browser has blocked notifications, Giddy explains how to allow them. On a first visit, a cookie bar offers Choose, Essential only and Allow all, all with the same weight. The choice lasts twelve months and can be changed on the Terms and privacy page.

## Your data

Download my data emails a link to everything Giddy holds about the family. The link needs sign-in and works for seven days. Deleting the account warns first if any booking isn't cancelled, and it asks the parent to type their email. It then removes the family, the parties they own and the chat, and co-planners lose access to those parties.

## How it is tested

The API tests cover inviting, joining and removing planners, share links and the shared summary, the notification centre, channels and quiet hours, text replies and unsubscribing, push subscriptions, settings and their rules, exports and account deletion, each with its permission checks. The browser tests drive sharing, the centre, toasts, settings and its dialogs, the push prompt and cookie consent against the fake API, with accessibility checks at phone and desktop widths.

## Recap

Things to remember. Plans are shared by role, and a view-only link hides guests. Every message lands in the centre and follows the parent's channels. Quiet hours and STOP are respected. And the parent can take their data, or delete it. Next, wrapping up after the party.
