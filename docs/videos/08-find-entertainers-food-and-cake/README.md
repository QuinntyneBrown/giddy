# 08 · Find entertainers, food and cake

> **Runtime:** ~3 min · **Audience:** contributors and product owners · **Prerequisites:** [07 · Build the guest list](../07-build-the-guest-list/README.md)

**Video:** [08-find-entertainers-food-and-cake.mp4](08-find-entertainers-food-and-cake.mp4) · [Slides](slides.html) · **Audio:** [08-find-entertainers-food-and-cake.mp3](08-find-entertainers-food-and-cake.mp3) · [Transcript](script.md)

## Why this video exists

Journey 08 ([prompt](../../prompts/08-find-entertainers-food-and-cake.md)) delivers Fun & food: entertainers, activities, food and cake with allergy information, quote requests, and expiring-quote warnings (L2-031 to L2-034).

## Learning objectives

By the end, the viewer can:

- say which vendors are listed for a party and how the theme filter works;
- explain how food vendors are checked against each child's allergies;
- describe the rules for requesting a quote;
- describe how quotes arrive, expire and are confirmed.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Which vendors are listed? | Free on the party date, within their service radius of the booked venue or the party's area, matching the theme filter and price |
| How are allergies matched? | By canonical allergen: "Peanut (EpiPen with parent)" counts as peanut; vendors declare what they are free of |
| When is a quote request refused? | A start time outside the venue booking, or a request to the same vendor in the last 24 hours |
| When is the parent warned about a quote? | Two days before it expires, with Confirm and Find another |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/Giddy.Application/Vendors/Search/SearchVendorsHandler.cs` | availability, travel, theme, allergy fit |
| `backend/src/Giddy.Domain/Catalogue/Allergens.cs` | canonical allergens |
| `backend/src/Giddy.Application/Vendors/Quotes/` | requesting, recording and confirming quotes |
| `frontend/projects/vendors/` | Fun & food and the quote dialog |
| `tools/video-record/record-clips.mjs` | clips start on a fresh frame |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:39 | Introduction, promises | What Fun & food guarantees |
| 00:39-01:36 | Entertainers | Theme filter, a quote request, empty results |
| 01:36-02:07 | Food and cake | Allergies by child, what each vendor can't meet |
| 02:07-02:18 | Expiring quotes | Confirm or find another |
| 02:18-03:10 | Tests, recap | API and browser coverage |

## Demo commands

```sh
dotnet test backend/Giddy.slnx
cd frontend && npx playwright test vendors
```

## Pitfalls

- No vendor directory provider is connected yet: quote requests are logged, and replies arrive at `POST /api/vendor-quotes` with the configured shared secret.
- Allergy fit is shown for food only; entertainers and activities aren't checked against allergies.

## References

- [Health Canada: priority food allergens](https://www.canada.ca/en/health-canada/services/food-allergies-intolerances/food-allergies.html)
- [WAI-ARIA: toggle buttons](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
