# 07 · Build the guest list

Before anyone can be invited, Giddy needs to know who's coming. This video shows how a parent finds guests on the list, adds a family, removes one with a way back, and imports a whole class list at once.

## What the guest list promises

The list shows who's invited, who's coming, who's waiting and who can't come, sorted by the child's name. A family is never added twice, and the list holds up to sixty guests. Removing someone is never silent and never final straight away: there's always a moment to undo it. And a class list is checked before anything is added.

## Finding and adding guests

Here is Amara with sixteen families on the list. Typing in the search box filters the table as she types, by child or parent. The chips show how many are coming, waiting or have allergies, and each one narrows the table. When she searches for a name that isn't there, Giddy offers to add it. The name carries into the dialog; she adds the parent's name and email. Because the invitations have already gone out, Send the invitation now is ticked, so Samira gets the same invitation straight away.

## Checks when adding

The add dialog checks the email and that a mobile number is Canadian before anything is saved, and lists every fix at the top. A child who is already on the list with the same parent email is refused with a message that says so.

## Removing with undo

On a phone, each row has its own actions, named with the child's name. Removing Leo asks first, says his parent won't be messaged, and puts the focus on Cancel. Once he's removed, the counts update and a toast offers Undo for eight seconds. Undo brings Leo back with his reply exactly as it was. On the server he stays restorable for ten minutes before he's purged.

## Importing a class list

Amara's class list is a spreadsheet. She chooses Import, picks the file, and Giddy checks it before adding anyone: one row has no parent email, and Maya is already on the list. Import three guests adds the rest, with a progress bar while the file uploads, then says exactly what was skipped and why. Files must be a CSV or Excel workbook up to two megabytes; they're scanned, read by cell value only, and never stored.

## Reusing last year's guests

The same dialog can reuse the guests from another of the family's parties, like Zuri's sixth birthday. Families already on this year's list are skipped, and nobody's old reply comes along.

## How it is tested

The API tests cover adding with the Canadian mobile check, duplicates, the sixty guest limit and sending now, removing and restoring within ten minutes, the private link stopping when a family is removed, checking and importing CSV and Excel files, the size and type limits, the malware scan, and reusing another party's guests. The browser tests drive search, chips, actions, the dialogs and undo against the fake API, with an accessibility check on each.

## Recap

Things to remember. Search and chips narrow the list as you go. A family is never added twice and the list holds sixty. Removing always offers undo. Class lists are checked before anything is added. Next, parents find entertainers, food and cake.
