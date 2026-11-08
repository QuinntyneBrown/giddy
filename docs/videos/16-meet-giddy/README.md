# 16 · Meet Giddy

> **Runtime:** ~0:21 (1.5 s of music, about 15.5 s of narration, a music tail) · **Audience:** parents visiting the marketing site · **Prerequisites:** none

**Video:** [16-meet-giddy.mp4](16-meet-giddy.mp4) · [Slides](slides.html) · **Audio:** [16-meet-giddy.mp3](16-meet-giddy.mp3) · [Transcript](script.md) · [Captions](16-meet-giddy.vtt) · **Poster:** [16-meet-giddy-poster.jpg](16-meet-giddy-poster.jpg)

## Why this video exists

The marketing site ([`docs/mocks/pages/marketing/default.html`](../../mocks/pages/marketing/default.html), "Giddy in twenty seconds", `L2-095`) plays this clip so a parent gets the pitch without reading: planning a kid's party in the GTA, a chat that turns into a priced plan with real venues, invites, RSVPs and the run sheet, and the call to action. It has no burned-in captions; the VTT is a caption track that is off by default, and the site shows the transcript.

## Learning objectives

By the end, the viewer can:

- say what Giddy does (plans a kid's party with them in a chat);
- name what the plan holds (real venues, fun and cake near them, priced);
- find the next step (start planning free).

## Assets on screen

| File | What to show |
|---|---|
| `slides.html` | The question on the hero gradient with Giddy the balloon; the chat's priced plan and the venues beside "Chat about your kid. Get a priced plan."; the party-day run sheet; the wordmark and "Start planning free". Built from the design-system tokens (`body.pitch` in `../assets/slides.css`). |
| `shots/phone-plan.png`, `phone-venues.png`, `phone-run-sheet.png` | Real phone screens of the app against the e2e fake API (`clips/shots.mjs`). |
| `../assets/music/en-la-playa-soca.mp3` | Soca bed from 20 s into the track at −15 dB, about 4 dB under the voice, with a 1.5 s lead-in and a fade out (JuliusH, Pixabay Content License). |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00–00:01.5 | Lead-in | Music alone on the first slide |
| 00:01.5–00:04.6 | The pain | "Planning a kid's party in the GTA?" |
| 00:04.6–00:11.3 | Chat and plan | "Just tell Giddy about your kid, and get real venues, fun and cake near you, in one priced plan." |
| 00:11.3–00:15.4 | The day | "Then invites, RSVPs and a run sheet for the day." |
| 00:15.4–00:20.7 | Close | Wordmark, "Start planning free."; the music plays on and fades |

## Demo commands

```sh
export PYTHON=.cache/venv/bin/python        # python3.12 -m venv .cache/venv && .cache/venv/bin/pip install kokoro soundfile
npx --prefix frontend ng serve --host 127.0.0.1   # in frontend/, for the shots
node tools/video-record/capture-shots.mjs docs/videos/16-meet-giddy --base http://127.0.0.1:4200
KOKORO_SPEED=1.0 node tools/video-audio/generate-audio.mjs docs/videos/16-meet-giddy --engine kokoro
node tools/video-build/build-video.mjs docs/videos/16-meet-giddy --check
node tools/video-build/build-video.mjs docs/videos/16-meet-giddy --no-captions
ffmpeg -ss 0.2 -i docs/videos/16-meet-giddy/16-meet-giddy.mp4 -frames:v 1 -q:v 3 -y docs/videos/16-meet-giddy/16-meet-giddy-poster.jpg
cp docs/videos/16-meet-giddy/16-meet-giddy.mp4 frontend/projects/marketing/public/meet-giddy.mp4
cp docs/videos/16-meet-giddy/16-meet-giddy-poster.jpg frontend/projects/marketing/public/meet-giddy.jpg
cp docs/videos/16-meet-giddy/16-meet-giddy.vtt frontend/projects/marketing/public/meet-giddy.vtt
```
