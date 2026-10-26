# 02 · Chat with Giddy

Giddy's headline feature is a conversation. A parent describes the party, watches Giddy work, gets a priced plan, and decides whether to use it. This video shows that conversation, what Giddy is and is not allowed to do, how it fails gracefully, and how parents control what it remembers.

## What chatting with Giddy promises

Giddy greets the parent by name and offers starter prompts. It shows its work as plain steps while it plans. Every price and venue in a plan comes from Giddy's own searches for this request. Nothing changes in the party until the parent confirms. And Giddy only remembers what the parent allows.

## From a sentence to a plan

Here is Amara on a laptop. Giddy greets her and offers four starters; the first is about Zuri's party. One tap sends it as her message. Each search appears as a step: venues within eight kilometres for that Saturday afternoon, entertainers for dinosaurs, bakeries with peanut-free cakes. Each is ticked when it finishes. Then the plan card: a theme, a venue, an entertainer, a cake, food and loot bags, each with a tax-inclusive price, and a total of seven hundred and seventy-eight dollars against her eight hundred dollar budget. Beside the chat, Party at a glance shows who, when, where, guests and budget, and Giddy knows lists what it remembers.

## Nothing changes until the parent confirms

Use this plan opens a dialog that lists every change: the theme, five bookings to do, the budget estimates, and a ten-step checklist working back from the party date. It says plainly that nothing is booked or paid yet. Only after she confirms does the party change, and the chat says the plan was saved. On a phone the same dialog is a bottom sheet.

## Grounded and safe

The server, not the model, decides what a plan contains. Giddy proposes catalogue IDs, and the server fills in names and prices. An item that was not in this turn's search results, is booked that day, is too far away, or is too small is rejected before the parent sees it. Food that conflicts with an allergy is flagged on the card. Instructions hidden in a venue's listing are stripped before the model reads them. Giddy has no tool that books, pays, sends anything, or contacts a vendor. And every turn is logged with the party for ninety days for support and safety review.

## Stop, and when things fail

On a phone, Amara asks Giddy to plan everything, then changes her mind and taps Stop. Giddy stops within a second, the finished step stays visible, and she can ask something new. When Giddy asks a question, up to four suggested replies appear in her voice. If a message cannot be sent, it stays in the log with Send again and Edit message. If the model provider is down, Giddy says it can't answer right now, and the rest of the app keeps working.

## What Giddy remembers

When a parent states a lasting fact, like a child's interests or a guest's allergy, Giddy remembers it for the family, never for anyone else, and never contact or payment details. Settings lists every memory as a chip, and Forget removes it. The next turn no longer knows it, because memories are read fresh every time.

## How it is tested

The API's integration tests run real turns against a scripted model: steps, proposals that are priced from the catalogue, rejected items, allergy flags, injection stripping, stopping, failures, memories across families, and applying a plan only with a planner's role. The browser tests drive the chat against a fake API at phone and desktop widths, with an accessibility check on the chat, the plan and the dialog.

## Recap

Things to remember. Giddy shows its work and stops when asked. Prices and availability come from the server, never from the model. Nothing changes until the parent confirms. Memories belong to one family and can be forgotten. Next, parents start a party plan of their own.
