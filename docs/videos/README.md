# Videos

Narrated walkthroughs made with the `creating-narrated-videos` skill
(`.claude/skills/creating-narrated-videos/SKILL.md`), one per journey in `docs/prompts/`. Each
folder holds the text the video is built from (`script.md`, `slides.html`, `README.md` outline),
the screen recordings it plays (`clips/`, recorded from `clips/clips.mjs`), stills (`shots/`,
captured from `clips/shots.mjs`) and the generated `NN-topic.mp3` and `NN-topic.mp4`.

| # | Video | Runtime | Covers |
|---|---|---|---|
| 01 | [Set up the foundation](01-set-up-the-foundation/README.md) | ~4 min | The shell, server-side authorisation, system states and GTA localisation |

## Making or updating a video

Run from the repository root with the web app running on port 4200. Recordings and stills
use the fake API in `tools/video-record/giddy-fake-api.mjs`, so no backend is needed.
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
