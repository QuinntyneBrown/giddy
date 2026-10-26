# Import guests in bulk

## Overview

Parents usually have a class list. Import reads a spreadsheet (.csv or .xlsx up to 2 MB), reuses guests from a past party, or picks phone contacts, then reports what was imported and skipped.

- **import job** — background task that scans, parses and validates an uploaded file and creates guests

This feature belongs to the **Guest list** subsystem. It is designed from the screens in [`docs/mocks`](../../../mocks/README.md) and the L2 requirements listed below.

## Description

The feature is a vertical slice from the Angular web application through the Giddy API to storage and any external services.

**Frontend (Giddy Web)**

- **`ImportGuestsDialog`** — Source choice, drop zone, progress bar, partial and success states.

**Backend (Giddy API)**

- **`ImportsController`** — `POST /api/parties/{id}/imports` (upload to blob via SAS), `GET .../imports/{jobId}`.
- **`ImportJob`** — Worker: malware scan, parse with formulas and macros disabled, validate rows, create guests, delete the file.
- **`SpreadsheetReader`** — CSV and XLSX reader that reads cell values only.
- **`ImportReport`** — Imported, skipped (duplicate), invalid (missing email) with row numbers.


**As built**

- Files are small (2 MB), so import is synchronous rather than a blob upload and job: `POST /api/parties/{id}/imports/check` previews a .csv or .xlsx (rows missing a parent email, guests already on the list), and `POST .../imports` adds the valid rows. The file is scanned through `IMalwareScanner`, read by cell value in memory by `SpreadsheetReader` (formulas are never evaluated, macros never loaded) and never stored.
- `GET .../imports/sources` and `POST .../imports/from-party` reuse another of the parent's parties' guests, without their replies.
- The dialog shows upload progress from the browser's progress events, names rows to fix, and reports what was imported and skipped.
- No malware-scanning service is connected yet: `UnscannedFileScanner` lets files through and logs that they were not scanned. Phone contacts wait for the Contact Picker decision and show as unavailable.

**Open points**

- Phone-contacts source: platform API and permission flow `<TO SUPPLY>`

## Requirements

The feature realizes the following level-2 (L2) requirements. Each L2 requirement refines the level-1 (L1) requirement cited beside it; the full acceptance criteria are in [`docs/specs/L2.md`](../../../specs/L2.md).

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-040` | `L1-010` | **Import guests in bulk.** Given the import dialog, when the parent chooses a spreadsheet, reuses guests from a past party, or picks from phone contacts, then the matching source is used; the Import button is disabled until a source with guests is chosen. |

## Diagrams

### System context

Uploaded files are checked by a malware scanner before anything reads them.

![C4 system context: Import guests in bulk](diagrams/c4-context.png)

### Containers

The browser uploads straight to blob storage with a short-lived SAS URL; the worker processes the file.

![C4 container view: Import guests in bulk](diagrams/c4-container.png)

### Components

The import job runs in the Background Worker.

![C4 component view: Import guests in bulk](diagrams/c4-component.png)

### Class structure

`ImportReport` records issues by row number for the dialog.

![Class diagram: Import guests in bulk](diagrams/class-structure.png)

### Behaviour — class list spreadsheet

The file is scanned before parsing and deleted afterwards; rows missing an email are reported by row and child (`L2-040`).

![Sequence diagram: Import — class list spreadsheet](diagrams/sequence-import.png)
