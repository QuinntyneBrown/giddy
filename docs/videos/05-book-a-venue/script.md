# 05 · Book a venue

Once a parent has found the right venue, Giddy books it: the slot is held at the venue, the deposit is paid, and the booking is confirmed in one step. This video shows booking a slot, what happens when something goes wrong, the bank's security check, the updates on the party overview, and cancelling.

## What booking promises

Booking is all or nothing. The slot is held at the venue and the deposit is authorised together; if either fails, neither happens, and the parent is told nothing was charged. Card details never reach Giddy: the payment provider keeps them and Giddy stores only its token, the card brand and the last four digits.

## Booking a slot

Here is Amara on Dino Den's page for Zuri's party. She picks one o'clock and chooses Book. The dialog shows the venue, the date and time, the room, how many kids it fits and the price. Her name, Zuri and a note about the peanut allergy are already filled in. Without a mobile number, Giddy stops and says why before anything is attempted. With one, she pays the one hundred dollar deposit with her saved Visa. While it pays, the dialog stays open and busy. Then: booked, with the confirmation number, and the venue page now shows her booking.

## When it doesn't go through

If another family books one o'clock while the dialog is open, Amara is told the slot was just taken, that nothing was charged, and what is still free. The alternatives are the venue's own free slots that day, so each one can really be booked. One click picks four o'clock, keeps everything she typed, and books it. If the venue doesn't confirm in time, the payment is cancelled, she's told nothing was charged, and Pay becomes Try again. A declined card works the same way: the hold is released, and she can choose another card.

## The bank's check

On a phone, Amara adds a new card. Until the payment provider is chosen, Giddy runs in test mode with the provider's test cards, so only a token is ever sent. This card asks the bank to check it's her. The venue holds the slot while she approves, and the booking completes only after the check passes. If she finishes later, the hold stays and the venue page offers to finish booking.

## Updates on the overview

The party overview keeps Amara posted. A hold shows when it expires, with Book now. A confirmation shows its number and can be dismissed, and the dismissal is remembered. A declined deposit stays on screen, with Try another card, until it's fixed. And a known disruption near the venue on the party day, like a TTC weekend closure on Queen Street East, shows a warning that can't be dismissed.

## Cancelling

Cancelling starts from the venue page. Inside the free cancellation window, two weeks before the party, the dialog says the deposit goes back to her card, and Keep booking has focus so nothing happens by accident. Confirming releases the slot and a message confirms the refund. After the window, the dialog says first that the deposit is non-refundable, and the button says Cancel without a refund.

## How it is tested

The API tests drive booking against a fake venue partner, a fake payment provider and a fake email sender: the confirmed booking and what it changes on the plan, an invalid mobile number, viewers and strangers, a slot taken meanwhile, a venue that doesn't confirm, a declined card, saved cards, the bank's check, every banner, and cancelling inside and outside the window. The browser tests drive the same flows against the fake API, with an accessibility check on each dialog and banner.

## Recap

Things to remember. A slot is never held without a payment, or a payment taken without a booking. Every failure says nothing was charged and offers the next step. Giddy keeps only a card's brand and last four digits. Banners that matter stay until they're fixed. Next, parents send invitations and track the replies.
