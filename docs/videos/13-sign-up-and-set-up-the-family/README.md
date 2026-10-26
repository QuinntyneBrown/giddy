# 13 · Sign up and set up the family

> **Runtime:** ~3.5 min · **Audience:** contributors and product owners · **Prerequisites:** [12 · Run the party day](../12-run-the-party-day/README.md)

**Video:** [13-sign-up-and-set-up-the-family.mp4](13-sign-up-and-set-up-the-family.mp4) · [Slides](slides.html) · **Audio:** [13-sign-up-and-set-up-the-family.mp3](13-sign-up-and-set-up-the-family.mp3) · [Transcript](script.md)

## Why this video exists

Journey 13 ([prompt](../../prompts/13-sign-up-and-set-up-the-family.md)) delivers accounts, sessions, the family and birthday reminders (L2-001 to L2-008 and L2-070).

## Learning objectives

By the end, the viewer can:

- describe the sign-up rules and what an existing address is told;
- explain how sign-in protects accounts: one message, the pause, rate limits, new-device emails;
- say how sessions end: sign-out, password changes, idle time, and the "Still there?" dialog;
- add, change and remove children, and say when birthday nudges are sent.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Why can't a stolen cookie outlive sign-out? | The cookie names a server-side session; every request checks it |
| How are passwords stored? | Identity's PBKDF2-HMAC-SHA512 at 210,000 iterations; breached passwords refused via k-anonymity |
| What happens after five wrong passwords? | The next attempt pauses sign-in for 15 minutes; a reset lifts it |
| When does a birthday nudge go? | 9:00 am Toronto, 42 days before a birthday with no party; once |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/Giddy.Application/Accounts/` | sign-up, verify, sign-in, reset, provider sign-in |
| `backend/src/Giddy.Domain/Parents/ParentSession.cs` | server-side sessions |
| `backend/src/Giddy.Api/Authentication/AuthenticationSetup.cs` | the cookie and its validation |
| `frontend/projects/account/` and `frontend/projects/family/` | the pages and dialogs |
| `frontend/src/app/session/session-expiry.interceptor.ts` | "Still there?" |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:45 | Introduction, promises | What accounts guarantee |
| 00:45-01:40 | Sign up | Check email, confirm, family setup |
| 01:40-02:20 | Sign in | Wrong password, keep me signed in, return |
| 02:20-03:00 | Family, still there | Family page, nudges, expired sessions |
| 03:00-03:40 | Tests, recap | API and browser coverage |

## Demo commands

```sh
dotnet test backend/Giddy.slnx
cd frontend && npx playwright test accounts family
```

## Pitfalls

- Google and Apple only appear to work when `Authentication:Google:*` and `Authentication:Apple:*` are configured from the environment.
- The demo accounts get a password only from `Giddy:DemoPassword`, never from the repository.

## References

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Have I Been Pwned: Pwned Passwords API](https://haveibeenpwned.com/API/v3#PwnedPasswords)
