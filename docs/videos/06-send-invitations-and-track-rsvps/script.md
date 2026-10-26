# 06 · Send invitations and track RSVPs

Once the venue is booked, the guests need to know. This video shows how Giddy drafts and sends the invitation, how guest families reply without an account, how the host hears about replies as they happen, how reminders work, and how the allergy list reaches the venue.

## What invitations promise

Every family gets a private link of their own, by email and by text wherever Giddy has their details. Replying needs no account, and the reply page shows only the invitation and that family's own reply, never anyone else on the list. The host hears about replies within seconds. And the venue only ever receives children's first names and allergies.

## Designing and sending

Here is Amara on the Invites tab. Giddy has already written a draft from the party: Zuri is turning seven, Saturday the fourteenth of November at Dino Den, with replies due eight days before. She tries the Volcano design, goes back to Dino green, and changes the headline; the preview follows every change, and the counters keep the headline and message short. Send me a test goes only to Amara. Then Send to sixteen families gives each family its private link, and the page says when Giddy will remind anyone who hasn't replied.

## Before it sends

Two things stop a send. An RSVP-by date on or after the party is caught right away. And until Amara's own email is verified, sending is blocked with a link to verify it, so families know the invitation really comes from her.

## Replying without an account

On a phone, Aisha's mum opens her private link. She sees the invitation, then the question: will Aisha come? Her name is already filled in. She says yes, adds a peanut allergy, says she'll stay, and leaves a mobile number for a reminder the day before. Giddy confirms the reply, repeats the allergy back to her, and offers a calendar file and a way to change the reply until the RSVP-by date. A link that no longer works says so, and shows nothing about the party.

## Hearing about replies

Back on the laptop, Amara has the guest list open. When Aisha's reply arrives, a toast says she's coming, the counts and her row update, and the peanut allergy joins the allergy list. Because it's a new allergy, a second toast is a warning that offers to share the list with Dino Den, and one click sends it. A bounced invitation shows a danger toast that stays until it's dismissed, with Fix email.

## Reminders

To nudge families who haven't replied, Amara ticks Aisha, Mateo and Ava. A bar shows who is selected and offers Send reminder. Giddy says the reminders are going out, then that they were sent. Ava's family left no email or mobile number, so a toast names them and stays, with Fix details. A family reminded in the last forty-eight hours is skipped, and Giddy says why.

## How it is tested

The API tests cover the guest list and who sees contact details, the draft and its limits, the test send, sending by each channel, the verified email rule, the private link's privacy, replies and changes, the calendar file, live updates for members only, reminders and their cooldown, bounces through the webhook, and sharing the allergy list. The browser tests drive the same flows against the fake API at phone and desktop widths, with an accessibility check on every page.

## Recap

Things to remember. Every family gets its own private link and needs no account. The reply page shows only that family's reply. The host hears about replies within seconds, and new allergies come with a way to tell the venue. Reminders skip families reminded in the last two days. Next, parents build and manage the guest list.
