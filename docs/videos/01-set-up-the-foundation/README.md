# 01 · Set up the foundation

> **Runtime:** ~3.5 min · **Audience:** contributors and product owners · **Prerequisites:** none

**Video:** [01-set-up-the-foundation.mp4](01-set-up-the-foundation.mp4) · [Slides](slides.html) · **Audio:** [01-set-up-the-foundation.mp3](01-set-up-the-foundation.mp3) · [Transcript](script.md)

## Why this video exists

Journey 01 ([prompt](../../prompts/01-set-up-the-foundation.md)) lays the foundation every later journey builds on: the components library, the responsive themed shell, server-side authorisation, system states and GTA localisation (L2-069 to L2-071, L2-079 to L2-091).

## Learning objectives

By the end, the viewer can:

- describe the shell at phone and desktop widths and where the theme choice lives;
- explain why a stranger gets 404 and a viewer gets 403 for the same party;
- say what a parent sees while a page loads, when it fails, and when they go offline;
- explain why countdowns use Toronto calendar days.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Who can see a party? | Its owner, co-planners and viewers; everyone else gets 404 before validation runs |
| Who can change it? | Owners and co-planners; viewers get 403; writes need the anti-forgery token |
| What does a failure look like? | The shell stays, the message says data is safe, Try again, a `GDY-` reference code |
| Why Toronto calendar days? | Countdowns and "today" must not shift with UTC or daylight saving |

## Code / assets on screen

| File | What to show |
|---|---|
| `frontend/projects/components/` | `@giddy/components`: shell parts, Mascot, ErrorPage, EmptyState, Skeleton, Alert |
| `backend/src/Giddy.Application/Parties/PartyAuthorizationBehavior.cs` | membership and role before validation |
| `backend/src/Giddy.Api/Authentication/AuthenticationSetup.cs` | HttpOnly, Secure, SameSite=Lax cookie; fallback policy |
| `backend/src/Giddy.Domain/Calendar/TorontoCalendar.cs` | Toronto calendar days |
| `frontend/e2e/fixtures/fake-api.ts` | the fake API that fails unknown requests |
| `clips/shell-desktop.mp4`, `clips/states-phone.mp4` | the running app against the fake API |
| `shots/*.png` | empty home, 403, 500 and offline |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:35 | Introduction, promises | What the foundation guarantees |
| 00:35-01:10 | Laptop shell | Sidebar, next party, dark theme, not found |
| 01:10-01:30 | Phone shell | Bottom bar, search, targets |
| 01:30-02:05 | The server decides | 404 for strangers, 403 for viewers, anti-forgery, UUIDs |
| 02:05-02:45 | When things go wrong | Skeletons, error and retry, offline, system pages |
| 02:45-03:05 | Made for the GTA | Calendar days, formats, postal codes |
| 03:05-03:30 | Library and tests, recap | Components library, fake API, axe |

## Demo commands

```sh
dotnet test backend/Giddy.slnx
cd frontend && npm ci && npm run lint && npx playwright test
# Recordings and stills (app running on :4200; the API is faked)
npm start --prefix frontend
node tools/video-record/record-clips.mjs docs/videos/01-set-up-the-foundation
node tools/video-record/capture-shots.mjs docs/videos/01-set-up-the-foundation
```

## Pitfalls

- Sign-in arrives in journey 13; until then the real API answers 401 to the browser, so demos and e2e use the fake API.
- The 404 page is a client route; returning HTTP 404 from the web host for unknown paths is a hosting concern still to configure.
- Toasts, dialogs and the form error summary are specified here but are built with the first screen that needs them.

## References

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [ASP.NET Core cookie authentication](https://learn.microsoft.com/aspnet/core/security/authentication/cookie)
- [Prevent CSRF attacks in ASP.NET Core](https://learn.microsoft.com/aspnet/core/security/anti-request-forgery)
- [NodaTime](https://nodatime.org/)
