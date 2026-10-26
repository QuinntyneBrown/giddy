# 03 · Start a party plan

> **Runtime:** ~4 min · **Audience:** contributors and product owners · **Prerequisites:** [02 · Chat with Giddy](../02-chat-with-giddy/README.md)

**Video:** [03-start-a-party-plan.mp4](03-start-a-party-plan.mp4) · [Slides](slides.html) · **Audio:** [03-start-a-party-plan.mp3](03-start-a-party-plan.mp3) · [Transcript](script.md)

## Why this video exists

Journey 03 ([prompt](../../prompts/03-start-a-party-plan.md)) lets parents create a party, follow it from My parties and the overview, lock it after the day, delete it safely, and see it on Home (L2-010 to L2-014, L2-062 to L2-064).

## Learning objectives

By the end, the viewer can:

- describe the basics form, its defaults, hints and error handling;
- state the readiness formula and where it appears;
- explain what locks a party and what the server does with changes afterwards;
- describe the two-step delete and who may delete.

## Key questions

| Question | What a strong answer includes |
|---|---|
| What does a new party need? | A child or someone else, a date from tomorrow, 1–60 kids, time of day, a budget and a postal code |
| How is readiness calculated? | Done tasks plus confirmed bookings over all tasks plus planned bookings, rounded to a whole percent |
| When does a party lock? | When its date is before today in America/Toronto; changes then get HTTP 409 |
| Who can delete? | Only the owner, after typing the exact name; others get 403, strangers 404 |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/Giddy.Application/Parties/CreateParty/` | validation and the handler |
| `backend/src/Giddy.Domain/Parties/Readiness.cs` | the formula |
| `backend/src/Giddy.Application/Parties/PartyAuthorizationBehavior.cs` | lock (409) and owner-only access |
| `backend/src/Giddy.Domain/Home/NudgeEngine.cs` | ordering and the limit of three |
| `frontend/projects/parties/` | new party, My parties, overview, delete dialog |
| `clips/*.mp4` | creating a party, the overview, deleting, the phone list and a past party |
| `shots/*.png` | errors, Home, My parties, a draft |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:30 | Introduction, promises | What starting a plan guarantees |
| 00:30-01:05 | The basics | Defaults, budget hint, into Ask Giddy |
| 01:05-01:30 | Fixing mistakes | Summary, inline errors, kept input, someone else |
| 01:30-02:15 | Overview and readiness | Hero, formula, sections, bookings failing alone |
| 02:15-02:45 | Deleting | Consequences, exact name, owner only |
| 02:45-03:05 | My parties, after the party | Groups, read-only past party, 409 |
| 03:05-03:35 | Home | Subtitle, nudges, quick start, first run |
| 03:35-04:05 | Tests, recap | API and browser coverage |

## Demo commands

```sh
dotnet test backend/Giddy.slnx
cd frontend && npx playwright test home new-party parties
```

## Pitfalls

- Children come from the family (`GET /api/family`); adding and editing children arrives in journey 13.
- Guests, RSVPs, bookings and the full checklist arrive in later journeys; until then the overview shows what Giddy's plan created.
- Past parties open their read-only overview; the wrap-up page arrives in journey 15.

## References

- [WCAG 2.2: error identification and suggestion](https://www.w3.org/TR/WCAG22/#error-identification)
- [GOV.UK design system: error summary](https://design-system.service.gov.uk/components/error-summary/)
