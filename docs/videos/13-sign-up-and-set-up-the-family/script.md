# 13 · Sign up and set up the family

Everything in Giddy starts with a parent's account and the kids they plan for. This video shows signing up, confirming an email, signing in safely, and telling Giddy about the family so birthdays never sneak up.

## What accounts promise

Signing up takes a first name, an email, a password and a GTA postal code. Passwords need at least ten characters with a number or a symbol, and Giddy refuses passwords that have shown up in a data breach. Every mistake says how to fix it. Sign-in never reveals whether the email or the password was wrong, and after five wrong tries it pauses for fifteen minutes. Sessions live on the server, so signing out or changing a password really ends them, and a sign-in from a new device sends an email.

## Signing up and setting up the family

Here's Rania signing up on a laptop. Once she creates her account, Giddy asks her to check her email. The link in that email confirms her address and signs her in, and then it's straight to family setup. She adds Zuri with her birthday, and as soon as the date is in, Giddy shows when Zuri turns seven. She picks Dinosaurs and Science, up to five interests, adds her, and goes home. A parent can also skip this step and add children later.

## Signing in

On a phone, Amara opens her parties while signed out, so Giddy asks her to sign in first. A wrong password gets one message that doesn't say which part was wrong, and her email stays in the field. With the right password and Keep me signed in ticked, she lands back on the page she asked for. Keep me signed in lasts thirty days from her last visit; otherwise the session ends when the browser closes. Google and Apple work too, once their keys are configured.

## The family page

The Family page shows each child with their next birthday and how many days away it is, their interests and any allergies, and whether a party is already planned. Six weeks before a birthday with no plan, Giddy sends a nudge to start planning, and Home's coming-up-next card only shows birthdays within four months.

## Still there?

If a session ends while a parent is in the middle of something, Giddy asks for the password again with the email filled in. Once they sign back in, the action carries on, and nothing they typed is lost. Signing out from Settings ends the session on the server and removes the run sheets saved on that device.

## How it is tested

The API tests cover sign-up and its rules, breached passwords, one answer for existing addresses, confirmation links that expire or are reused, resending once a minute, bounces, sign-in with the pause, cookies and keep me signed in, signing out on the server, new-device emails, rate limits, anti-forgery, password resets that sign out everywhere else, Google and Apple, children and their rules, and birthday nudges. The browser tests drive every page and dialog against the fake API, including the expired session that keeps a half-added guest, with accessibility checks at phone and desktop widths.

## Recap

Things to remember. Mistakes say how to fix them. Sign-in protects the account without giving anything away. Sessions are real on the server. And the family's birthdays drive Giddy's nudges. Next, managing plans and notifications.
