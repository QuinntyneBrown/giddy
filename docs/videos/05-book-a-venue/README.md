# 05 · Book a venue

> **Runtime:** ~4 min · **Audience:** contributors and product owners · **Prerequisites:** [04 · Find and compare venues](../04-find-and-compare-venues/README.md)

**Video:** [05-book-a-venue.mp4](05-book-a-venue.mp4) · [Slides](slides.html) · **Audio:** [05-book-a-venue.mp3](05-book-a-venue.mp3) · [Transcript](script.md)

## Why this video exists

Journey 05 ([prompt](../../prompts/05-book-a-venue.md)) delivers booking a venue slot, the deposit, and booking status, holds and cancellation (L2-028 to L2-030).

## Learning objectives

By the end, the viewer can:

- explain why a hold is never left without a payment, or a payment without a booking;
- describe each failure (slot taken, card declined, venue timeout) and what the parent sees;
- describe the 3-D Secure hold and what Giddy keeps of a card;
- describe the overview's booking banners and the cancellation rules.

## Key questions

| Question | What a strong answer includes |
|---|---|
| What makes booking all or nothing? | Hold, authorise, confirm, capture; a failed step voids the authorisation and releases the hold |
| What if the slot was just taken? | HTTP 409 with the venue's other free slots that day; no payment |
| What does Giddy store about a card? | The provider's token, the brand and the last four digits |
| When is the deposit refunded? | On or before the free-cancellation date (14 days before by default); after it, the dialog says it is non-refundable first |
| Which banners can't be dismissed? | A declined deposit and a disruption on the party day |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/Giddy.Application/Bookings/BookVenue/BookVenueHandler.cs` | hold, authorise, 3-D Secure, compensation |
| `backend/src/Giddy.Application/Bookings/BookingCompletion.cs` | confirm, capture, the catalogue mirror |
| `backend/src/Giddy.Application/Bookings/GetBookingNotices/` | hold, confirmed, declined and disruption banners |
| `backend/src/Giddy.Infrastructure/Bookings/` | the catalogue venue partner, the sandbox payment gateway, the logging email sender |
| `frontend/projects/venues/src/lib/book-venue-dialog/` | every state of the booking dialog |
| `frontend/projects/venues/src/lib/cancel-booking-dialog/` | refundable and non-refundable cancellation |
| `frontend/e2e/fixtures/fake-bookings.ts` | the fake API's bookings, also used for the recordings |
| `clips/*.mp4`, `shots/*.png` | booking, a taken slot, the bank's check on a phone, cancelling, banners, a timeout |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:40 | Introduction, promises | All or nothing; card details stay with the provider |
| 00:40-01:17 | Booking a slot | Pre-filled dialog, mobile check, busy, confirmation |
| 01:17-01:44 | When it doesn't go through | Slot taken and alternatives, timeout, declined |
| 01:44-02:10 | The bank's check | Test cards, 3-D Secure hold, finish later |
| 02:10-02:36 | Updates on the overview | Hold, confirmation, declined, disruption |
| 02:36-03:03 | Cancelling | Refund inside the window, non-refundable after |
| 03:03-04:05 | Tests, recap | API and browser coverage |

## Demo commands

```sh
dotnet test backend/Giddy.slnx
cd frontend && npx playwright test bookings booking-notices cancel-booking
```

## Pitfalls

- The payment provider, venue partner APIs, email provider and disruption feeds are still to be chosen. Until then `SandboxPaymentGateway` accepts only test tokens, `CatalogueVenuePartner` books against the catalogue's slots, email is logged, and disruptions are seeded.
- Partner and payment webhooks arrive with those providers; for now bookings change state synchronously.

## References

- [PCI DSS overview](https://www.pcisecuritystandards.org/standards/pci-dss/)
- [EMV 3-D Secure](https://www.emvco.com/emv-technologies/3-d-secure/)
- [WAI-ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
