# 07 · Build the guest list

> **Runtime:** ~3.5 min · **Audience:** contributors and product owners · **Prerequisites:** [06 · Send invitations and track RSVPs](../06-send-invitations-and-track-rsvps/README.md)

**Video:** [07-build-the-guest-list.mp4](07-build-the-guest-list.mp4) · [Slides](slides.html) · **Audio:** [07-build-the-guest-list.mp3](07-build-the-guest-list.mp3) · [Transcript](script.md)

## Why this video exists

Journey 07 ([prompt](../../prompts/07-build-the-guest-list.md)) delivers the guest list's search and filters, adding, removing with undo and importing (L2-038 to L2-041; L2-042 and L2-046 arrived in journey 06).

## Learning objectives

By the end, the viewer can:

- find guests with search and the filter chips;
- explain the rules for adding a guest: Canadian mobile, no duplicates, 60 at most, send now;
- describe removing with undo and how long a guest can be restored;
- describe how a class list is checked, imported and kept safe.

## Key questions

| Question | What a strong answer includes |
|---|---|
| When is a guest a duplicate? | Same child name and same parent email, ignoring case |
| How long can a removal be undone? | Undo shows for 8 seconds; the server can restore for 10 minutes, then purges |
| What does importing skip? | Rows without a parent email, guests already on the list, rows past 60 |
| How is an uploaded file handled? | .csv or .xlsx up to 2 MB, scanned, read by cell value in memory, never stored |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/Giddy.Application/Guests/AddGuest/`, `RemoveGuest/`, `RestoreGuest/` | the rules for adding and removing |
| `backend/src/Giddy.Application/Guests/Import/GuestImporter.cs` | checking and importing rows |
| `backend/src/Giddy.Infrastructure/Guests/SpreadsheetReader.cs` | CSV and XLSX by cell value |
| `frontend/projects/guests/` | the guest list and its dialogs |
| `frontend/projects/components/src/lib/file-drop/`, `progress/`, `search-field/` | new library components |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:36 | Introduction, promises | What the list guarantees |
| 00:36-01:23 | Finding and adding | Search, chips, add and invite, checks |
| 01:23-01:49 | Removing | Confirm, Undo |
| 01:49-02:29 | Importing | Check, progress, report, reuse |
| 02:29-03:21 | Tests, recap | API and browser coverage |

## Demo commands

```sh
dotnet test backend/Giddy.slnx
cd frontend && npx playwright test manage-guests add-guest import-guests
```

## Pitfalls

- No malware-scanning service is connected yet: the scanner placeholder lets files through and logs that they weren't scanned.
- Phone contacts wait for the Contact Picker decision and show as unavailable.

## References

- [OWASP: file upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [OWASP: CSV injection](https://owasp.org/www-community/attacks/CSV_Injection)
- [WAI-ARIA: progressbar](https://www.w3.org/WAI/ARIA/apg/patterns/meter/)
