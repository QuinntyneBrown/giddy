# Videos

Narrated walkthroughs made with the `creating-narrated-videos` skill
(`.claude/skills/creating-narrated-videos/SKILL.md`), one per journey in `docs/prompts/`. Each
folder holds the text the video is built from (`script.md`, `slides.html`, `README.md` outline),
the screen recordings it plays (`clips/`, recorded from `clips/clips.mjs`), stills (`shots/`,
captured from `clips/shots.mjs`) and the generated `NN-topic.mp3` and `NN-topic.mp4`.

| # | Video | Runtime | Covers |
|---|---|---|---|
| 01 | [Set up the foundation](01-set-up-the-foundation/README.md) | ~4 min | The shell, server-side authorisation, system states and GTA localisation |
| 02 | [Chat with Giddy](02-chat-with-giddy/README.md) | ~4 min | Visible steps, grounded priced plans, confirmation, Stop, failures and memories |
| 03 | [Start a party plan](03-start-a-party-plan/README.md) | ~4 min | New party basics, readiness, the overview, locking, deleting and Home |
| 04 | [Find and compare venues](04-find-and-compare-venues/README.md) | ~3.5 min | Venue search, filters, relaxation, venue pages, slots and comparison |
| 05 | [Book a venue](05-book-a-venue/README.md) | ~4 min | Booking a slot, the deposit, failures, 3-D Secure, booking banners and cancelling |
| 06 | [Send invitations and track RSVPs](06-send-invitations-and-track-rsvps/README.md) | ~4 min | The invitation, private RSVP links, live updates, reminders and the allergy list |

## Making or updating a video

Run from the repository root with the web app running on port 4200. Recordings and stills
use a fake API, so no backend is needed: from video 04 the e2e suite's own `FakeApi`
(loaded by `tools/video-record/e2e-fake-api.mjs`), earlier videos `tools/video-record/giddy-fake-api.mjs`.
Generated timing and slide renders go to `.cache/` (ignored by git).

```sh
export PYTHON=python3
python3 -m pip install edge-tts                         # free Edge read-aloud, needs internet
node tools/video-audio/generate-audio.mjs docs/videos/NN-topic --dry-run
node tools/video-audio/generate-audio.mjs docs/videos/NN-topic
node tools/video-record/record-clips.mjs docs/videos/NN-topic --base http://127.0.0.1:4200
node tools/video-record/capture-shots.mjs docs/videos/NN-topic --base http://127.0.0.1:4200
node tools/video-build/build-video.mjs docs/videos/NN-topic --check
node tools/video-build/build-video.mjs docs/videos/NN-topic --slides-only
node tools/video-build/build-video.mjs docs/videos/NN-topic --no-captions   # captions only when asked for
```

The tools need Node 22+, Python 3 with `edge-tts`, ffmpeg with libx264, and Playwright
installed in `frontend/`. Acronyms are spoken through `tools/video-audio/pronunciations.json`.

### Background music (mandatory)

Every deck names `<body data-music="../assets/music/on-the-beach-intro-outro.mp3">`; the builder
lays it under the narration at −10.8 dB with a fade in and a 3 s tail. Source and licence are in
`assets/music/README.md`.
