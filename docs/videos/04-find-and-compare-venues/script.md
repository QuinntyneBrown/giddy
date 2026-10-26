# 04 · Find and compare venues

The venue is the biggest decision in a kids' party. This video shows how Giddy finds venues that are actually free on the party's date, near home and big enough, how a parent narrows and sorts them, what a venue's page shows, and how to compare a short list side by side.

## What venue search promises

Search starts from the party: its date, its number of kids and its area. Only venues free on that date, within the distance and big enough are listed. Every distance is in kilometres from the party's area. And when nothing matches, Giddy says why and how to fix it.

## Searching and narrowing

Here is Amara on a laptop. The filters are already filled in from Zuri's party: Saturday the fourteenth of November, sixteen kids, near Leslieville. Five venues are free. Each card shows the neighbourhood and distance, how many kids it fits and their ages, the rating, key features, the price including tax for its duration, and the free slot. A venue that fits fifteen says so plainly: you invited sixteen. Turning on nut-free kitchen narrows the list to two and the count follows. Sorting by price reorders the cards, and Giddy remembers that choice for the session.

## When nothing matches

Here a maximum of two hundred and fifty dollars and a nut-free kitchen find nothing. The empty state names both filters and offers one change that works: raise the price to three hundred and forty dollars and one venue appears. If venue partners don't answer in time, an error explains it and every filter stays as it was. And for a postal code outside Toronto, Durham, York, Peel or Halton, Giddy says plainly that it covers the GTA for now.

## A venue's page

On a phone, a venue's page shows photos, rating, address and distance, what the price includes, add-ons and what parents say. Saving to favourites is a toggle announced to screen readers. Each start time is a button; a taken one is disabled and read as booked, and the earliest free one is picked for you. When a date is fully booked, the page offers the nearest free date at the same venue, a similar venue that is free, and a way to be told if a slot opens.

## Comparing venues

Back on the laptop, ticking Compare on up to three venues brings up a bar with the count; a fourth tick is refused with a message. The comparison lines them up for price, free time, size, distance, rating, nut-free kitchen, party host and theme fit. The best value in each row says Best in words as well as colour, and Giddy's pick sits above the table with its reason.

## How it is tested

The API tests search the seeded GTA catalogue: free slots on the date, close fits, distance, each filter and sort, the relaxation hint, an availability timeout answered with a service-unavailable error, postal codes outside the GTA, slots and alternatives on a venue's page, favourites per family, the waitlist, and the comparison's best values and pick. The browser tests drive the same flows against the fake API at phone and desktop widths, with an accessibility check on each page.

## Recap

Things to remember. Search starts from the party and lists only venues that are free, near and big enough. Empty results come with a fix that works. Booked slots are disabled and named. Comparisons say which value is best in words. Next, parents book a venue and pay the deposit.
