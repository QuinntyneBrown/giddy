# 08 · Find entertainers, food and cake

With the venue booked and the guests invited, the party needs fun and food. This video shows Fun and food: finding entertainers and activities that suit the party, choosing food that every child can eat, asking vendors for quotes, and hearing before a quote runs out.

## What Fun and food promises

Every vendor listed is free on the party date and travels or delivers to the booked venue, or to the party's area until a venue is booked. The party's theme filter starts on, and can be turned off. Vendors already in the plan say so. And for food, every recorded allergy is checked against every vendor.

## Finding entertainers

Here is Amara on Fun and food. Three entertainers suit Zuri's Dino Dig and are free on Saturday the fourteenth. Each card shows the price, the rating, how long the show runs and the ages it suits, and Professor Fizz is already in the plan. Turning the Dino Dig filter off shows everyone who's free, and turning it back on narrows the list again. She asks Rexy the Dino Visit for a quote. The dialog fills in the date, a start time during the venue booking, sixteen kids, Dino Den and a message about Zuri's party, and once it's sent, says when to expect a reply. Rexy now shows as quote requested, in Fun and food and in the plan.

## When nothing fits

If the filters match nothing, they stay where they are and Giddy says which filter to change, with one that works. And a start time outside the venue booking is caught in the dialog, with the hours Amara has the venue.

## Food that every child can eat

On a phone, Food and cake opens with a warning: three guests have allergies, dairy for Maya, gluten for Hana and peanut for Arjun. Every bakery and caterer says whether it can meet them. Sweet Rex is nut-free but can't meet dairy or gluten. Cake Corner can't meet any of them, and Popsicle Parade can't meet gluten. Allergies are matched by what they are, so a note like peanut, EpiPen with parent, still counts as peanut, and Giddy's own suggestions are flagged the same way.

## Quotes that expire

When a quote is about to run out, the party overview says so two days before, with Confirm and Find another. Confirming books the vendor in the plan.

## How it is tested

The API tests cover vendors free on the date who travel to the party, the theme filter, plan status, allergy fit by canonical allergen, empty results with a fix, privacy, quote requests within the venue hours and once a day, replies through the vendor webhook and its secret, the expiring banner and confirming. The browser tests drive the same flows against the fake API at phone and desktop widths, with an accessibility check on the page and the dialog.

## Recap

Things to remember. Vendors are free that day and come to the party. The theme filter starts on. Food is checked against every child's allergy. Quote requests fit the venue booking, and expiring quotes are flagged two days ahead. Next, parents choose a theme.
