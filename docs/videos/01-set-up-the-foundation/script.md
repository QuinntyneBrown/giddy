# 01 · Set up the foundation

Giddy plans kids' birthday parties for families in the GTA. Before any party can be planned, the app needs a foundation every later feature stands on. This video shows the shell parents will live in, how the server decides who sees which party, what happens when something goes wrong, and how Giddy speaks like a Toronto neighbour.

## What the foundation promises

One shell on every screen, on a phone or a laptop. Every party request checked on the server, never trusted to the screen. Loading, empty and error states that keep the parent's place and say what to do next. And dates, money and places that make sense in the Greater Toronto Area.

## The shell on a laptop

Here is Amara on a laptop. From ten twenty-four pixels wide, a sidebar holds the Giddy wordmark, a Plan a party button, and navigation grouped into Explore and You. The top bar has search, a dark theme switch and her avatar. Her next party is up front: Zuri's Dino Dig, twenty days to go, Saturday the fourteenth of November, one to three thirty. She switches to the dark theme, and Giddy remembers that choice on this device. A link to a page that does not exist gets a friendly not found page with a way home.

## The shell on a phone

On a phone, the sidebar becomes a bottom bar with Home, Explore, Ask Giddy raised in the middle, Parties and Family. Search hides below seven sixty-eight pixels, and nothing ever scrolls sideways. Every target in the bars is at least forty-four pixels tall.

## The server decides

Every endpoint needs a signed-in parent unless it opts out, and the session cookie is HttpOnly, Secure and SameSite Lax. Every party request passes one check before anything else runs. If you are not a member of a party, it does not exist for you, so you get not found. A viewer who tries to change a party gets forbidden, and nothing changes. Only then does validation run, so field errors never leak a stranger's party. State changes also need an anti-forgery token, and party identifiers are UUIDs, so they cannot be guessed.

## When things go wrong

When the home takes longer than three hundred milliseconds, skeletons shaped like the page appear, and the region is marked busy for screen readers. When it fails, the navigation stays, the message says the parties are safe, and a reference code like G D Y seven Q two K is there to quote. Try again brings the party back. Losing the connection shows a banner, and coming back says so. Not found, private plan, server error and offline each have their own page, with a mascot in the right mood and a way forward.

## Made for the GTA

Countdowns count calendar days in Toronto, so a party is twenty days away whether it is four in the afternoon or eleven thirty at night, and daylight saving never shifts it. Dates read like Sat fourteen Nov, times like one to three thirty pm, and money in Canadian dollars. Postal codes are checked as Canadian and matched to Toronto, Durham, York, Peel or Halton.

## One library, tested end to end

Every screen is composed from one components library, built once from the design system. A lint check rejects raw colours and z-index values in component styles. The API has thirty-three integration tests against a fake database, including another family's token on every write. The browser has forty-eight Chromium tests against a fake API that fails any request it does not know, with an axe check on every state at phone and desktop widths.

## Recap

Things to remember. One shell, a sidebar on wide screens and a bottom bar on phones. The server checks membership and role on every party request. Failures keep the parent's place and give a reference code. Every date is a Toronto calendar day. Next, parents chat with Giddy to plan a party.
