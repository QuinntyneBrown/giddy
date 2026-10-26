# 15 · Wrap up after the party

> **Runtime:** ~3 min · **Audience:** contributors and product owners · **Prerequisites:** [14 · Manage plans and notifications](../14-manage-plans-and-notifications/README.md)

**Video:** [15-wrap-up-after-the-party.mp4](15-wrap-up-after-the-party.mp4) · [Slides](slides.html) · **Audio:** [15-wrap-up-after-the-party.mp3](15-wrap-up-after-the-party.mp3) · [Transcript](script.md)

## Why this video exists

Journey 15 ([prompt](../../prompts/15-wrap-up-after-the-party.md)) delivers wrap-up after the party: thank-you notes, ratings of the businesses booked, final numbers, and saving the plan for next year (L2-052 to L2-054).

## Learning objectives

By the end, the viewer can:

- say when wrap-up opens and who gets a thank-you note;
- explain how a logged gift and the parent's own wording shape a note, and how sending stays at once;
- say which businesses can be rated and how ratings count;
- save a plan for next year, start a party from it, and say when Giddy reminds the parent.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Who gets a thank-you note? | Every guest who replied Coming; guests without an email are marked No email and not sent |
| What happens to a note when a gift is added? | Giddy's draft mentions it, unless the parent has changed the wording, which is kept |
| Which businesses can be rated? | Only those in the plan with a confirmed booking or accepted quote; 1 to 5 stars, review optional |
| When does the reminder come? | Eight weeks before the next birthday that is still at least eight weeks away, from 9 am, once |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/Giddy.Application/Wrapping/WrapUpHandlers.cs` | drafts, sending, ratings, final numbers, saved plans |
| `backend/src/Giddy.Application/Wrapping/TemplateReminders.cs` | the reminder |
| `backend/src/Giddy.Domain/Wrapping/` | `ThankYouNote`, `ProviderRating`, `PartyTemplate` |
| `frontend/projects/wrap-up/` | the page and its two dialogs |
| `frontend/projects/components/src/lib/star-rating/` | the star rating control |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:33 | Introduction, opens | What wrap-up holds, and when |
| 00:33-01:15 | Thank-you notes | Drafts, a gift, No email, sending |
| 01:15-01:43 | Ratings and numbers | Stars, a review, final numbers |
| 01:43-02:06 | Next year | Save as template, the reminder, reuse |
| 02:06-02:56 | Tests, recap | API and browser coverage |

## Demo commands

```sh
dotnet test backend/Giddy.slnx --filter WrapUpTests
cd frontend && npx playwright test wrap-up
```

## Pitfalls

- Wrap-up changes need the party to have happened; before that the API answers 409.
- A business booked outside Giddy can't be rated, because there is no confirmed booking to tie the rating to.

## References

- [WAI-ARIA Authoring Practices: Button (toggle)](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [Angular Router: withInMemoryScrolling](https://angular.dev/api/router/withInMemoryScrolling)
