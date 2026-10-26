# 14 · Manage plans and notifications

> **Runtime:** ~4 min · **Audience:** contributors and product owners · **Prerequisites:** [13 · Sign up and set up the family](../13-sign-up-and-set-up-the-family/README.md)

**Video:** [14-manage-plans-and-notifications.mp4](14-manage-plans-and-notifications.mp4) · [Slides](slides.html) · **Audio:** [14-manage-plans-and-notifications.mp3](14-manage-plans-and-notifications.mp3) · [Transcript](script.md)

## Why this video exists

Journey 14 ([prompt](../../prompts/14-manage-plans-and-notifications.md)) delivers plan sharing, the notification centre, toasts and banners, message delivery, push, settings, cookie consent, and data export and deletion.

## Learning objectives

By the end, the viewer can:

- share a plan by role and explain what the view-only link hides;
- say where every message lands and how its channels, quiet hours and STOP apply;
- change settings, knowing what saves with the button and what saves at once;
- describe when Giddy asks about push and cookies, and how a parent takes or deletes their data.

## Key questions

| Question | What a strong answer includes |
|---|---|
| What does a view-only link show? | A party summary without any guest's details; a new link switches the old one off |
| When are texts held back? | Quiet hours, 9 pm to 7 am Toronto, unless the message is urgent on the party day |
| When does Giddy ask about push? | Only after the first invitations, explaining first; Not now waits 30 days |
| What does deleting the account keep? | Payment records only as the law requires; live bookings aren't cancelled, and the parent is warned |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/Giddy.Application/Sharing/` | invites, joining, share links, the summary |
| `backend/src/Giddy.Application/Notifications/NotificationOutbox.cs` | the centre, channels and quiet hours |
| `backend/src/Giddy.Application/Settings/` and `Privacy/` | settings, export and deletion |
| `frontend/projects/settings/` | the settings page and its dialogs |
| `frontend/projects/core/src/lib/notifications/push-prompt.ts` | when Giddy asks about push |
| `frontend/projects/core/src/lib/privacy/cookie-consent.ts` | the cookie choice |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:52 | Introduction, sharing | Invite by role, the view-only link |
| 00:52-01:17 | Notification centre | New and earlier, the bell, toasts |
| 01:17-01:45 | Delivery | Channels, quiet hours, STOP, unsubscribe |
| 01:45-02:13 | Settings | One save, quiet hours at once, download |
| 02:13-02:42 | Push and cookies | Ask after invitations; equal choices |
| 02:42-03:05 | Your data | Export link, deleting with a warning |
| 03:05-03:56 | Tests, recap | API and browser coverage |

## Demo commands

```sh
dotnet test backend/Giddy.slnx
cd frontend && npx playwright test sharing notifications toasts settings push-prompt cookie-consent
```

## Pitfalls

- Push delivery only logs until VAPID keys are configured, and the web app does not subscribe yet.
- Text replies reach `/api/sms-events` only with the `X-Giddy-Webhook-Secret` header matching `Giddy:SmsEventsSecret`, which comes from the environment.

## References

- [MDN: Notification.requestPermission()](https://developer.mozilla.org/en-US/docs/Web/API/Notification/requestPermission_static)
- [CRTC: Canada's anti-spam legislation](https://crtc.gc.ca/eng/internet/anti.htm)
