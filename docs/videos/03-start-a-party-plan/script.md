# 03 · Start a party plan

Before Giddy can help, a parent needs a party to plan. This video shows how a party starts from a few basics, how My parties and the party overview keep it in view, what happens after the party, how an owner deletes one, and what Home now shows.

## What starting a plan promises

A party takes about a minute to start. Every party has one readiness number, the same on Home, My parties and the overview. A party that has happened becomes read-only. Only the owner can delete it, and never by accident.

## The basics

Here is Amara planning Zuri's party on a laptop. Zuri is picked, so the date is already her birthday, Saturday the fourteenth of November, and the area is the family's postal code in Leslieville. Sixteen kids brings up a hint: parties that size in Toronto typically cost six hundred to eleven hundred dollars. She sets eight hundred, keeps the afternoon, and Plan it with Giddy creates the party and takes her straight into Ask Giddy with these details.

## When something needs fixing

A date that is today or in the past, or a number of kids outside one to sixty, stops the form. A summary at the top takes focus and links to each field, every field says what to fix, and nothing is created. If saving fails, everything she typed stays put for another try. Someone else can be the birthday star too, with a name and an age.

## The overview and readiness

Home now leads with the soonest party: its countdown, date, venue, kids and readiness. Open plan shows the overview. Readiness is completed tasks plus confirmed bookings, over all tasks plus planned bookings: here twenty-seven percent. Below are the bookings with their prices and status, the next three tasks with the overdue one flagged, guests and allergies, the budget, and who is planning together. Bookings load on their own, so if vendor status fails, only that card warns and offers Try again.

## Deleting a party

Delete this party explains exactly what is lost, says guests won't be notified, warns that a confirmed booking is not cancelled, and puts focus on Cancel. Continuing asks for the party's exact name. A typo explains what to type, and nothing is deleted. The exact name deletes it for every planner and returns to My parties. Co-planners and viewers never see the control, and the server refuses them too.

## My parties, and after the party

On a phone, My parties groups upcoming parties, drafts and past ones, each with its count. A past party opens read-only, with links to send thank-yous and reuse the plan. Once the day has passed in Toronto, the server refuses any change with a conflict.

## Home and Giddy's nudges

Home's subtitle counts parties in progress and what needs the parent this week. Giddy's nudges list overdue tasks first, then what is due this week, at most three, each with one action, and they load separately so a failure stays in that card. Quick start, RSVPs with allergies, and the next birthday that has no plan yet complete the page. A parent with no parties is welcomed with one primary action: Plan a party.

## How it is tested

The API tests create parties and reject past dates and impossible guest counts, check the readiness formula, the overview, the lock at midnight in Toronto, owner-only delete with another family's token, and the order and limit of nudges. The browser tests drive the form, the lists, the overview, the delete dialog and Home against the fake API at phone and desktop widths, with an accessibility check on each.

## Recap

Things to remember. A party starts from a few basics and continues in Ask Giddy. Readiness is one formula shown everywhere. Past parties are read-only on the server. Only the owner deletes, and only after typing the name. Next, parents find and compare venues.
