# 06 · Send invitations and track RSVPs

> **Runtime:** ~4 min · **Audience:** contributors and product owners · **Prerequisites:** [05 · Book a venue](../05-book-a-venue/README.md)

**Video:** [06-send-invitations-and-track-rsvps.mp4](06-send-invitations-and-track-rsvps.mp4) · [Slides](slides.html) · **Audio:** [06-send-invitations-and-track-rsvps.mp3](06-send-invitations-and-track-rsvps.mp3) · [Transcript](script.md)

## Why this video exists

Journey 06 ([prompt](../../prompts/06-send-invitations-and-track-rsvps.md)) delivers invitations, account-free RSVPs, live updates for the host, reminders and sharing the allergy list (L2-042 to L2-046).

## Learning objectives

By the end, the viewer can:

- describe how the invitation is drafted, tested and sent, and what stops a send;
- explain why a family's private link shows only their own reply;
- describe how the host hears about replies, new allergies and bounces;
- explain the reminder rules and what reaches the venue.

## Key questions

| Question | What a strong answer includes |
|---|---|
| What does a family need to reply? | Only their private link: a 128-bit token, stored as a hash, no account |
| What can the reply page show? | The invitation and that family's reply, never other guests |
| How fast does the host hear? | Within five seconds: the app polls every three seconds |
| When is a reminder skipped? | The family replied, wasn't invited yet, or was reminded in the last 48 hours |
| What does the venue receive? | Children's first names and allergies only |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/Giddy.Application/Invitations/` | the draft, sending and `RsvpTokens` |
| `backend/src/Giddy.Application/Rsvps/` | the anonymous reply, its privacy and the calendar file |
| `backend/src/Giddy.Application/Live/` | `PartyEvents` and the live updates query |
| `backend/src/Giddy.Application/Guests/` | the guest list, reminders, bounces and the allergy list |
| `frontend/projects/guests/`, `frontend/projects/invitations/` | the guest list, live toasts, the invitation editor and the RSVP page |
| `frontend/e2e/fixtures/fake-guests.ts` | the fake API used by tests and recordings |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:42 | Introduction, promises | Private links, no account, privacy |
| 00:42-01:33 | Designing and sending | Draft, preview, test, send, reminder date |
| 01:33-02:06 | Replying | The phone RSVP, a link that no longer works |
| 02:06-02:33 | Live updates | A reply, a new allergy, a bounce |
| 02:33-02:59 | Reminders | Selection, toasts, who can't be reached |
| 02:59-03:57 | Tests, recap | API and browser coverage |

## Demo commands

```sh
dotnet test backend/Giddy.slnx
cd frontend && npx playwright test guests invitation rsvp live-updates
```

## Pitfalls

- Email and text providers are not connected yet: messages go through `IEmailSender` and `ISmsSender`, which log until they are. Bounces arrive at `POST /api/email-events` with the configured shared secret.
- Live updates use polling instead of SignalR; the automatic reminder's date is shown, and sending it arrives with scheduled notifications.

## References

- [OWASP: insecure direct object references](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
- [RFC 5545: iCalendar](https://www.rfc-editor.org/rfc/rfc5545)
- [WAI-ARIA: status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
