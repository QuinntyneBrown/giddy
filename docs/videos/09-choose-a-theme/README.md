# 09 · Choose a theme

> **Runtime:** ~2 min · **Audience:** contributors and product owners · **Prerequisites:** [08 · Find entertainers, food and cake](../08-find-entertainers-food-and-cake/README.md)

**Video:** [09-choose-a-theme.mp4](09-choose-a-theme.mp4) · [Slides](slides.html) · **Audio:** [09-choose-a-theme.mp3](09-choose-a-theme.mp3) · [Transcript](script.md)

## Why this video exists

Journey 09 ([prompt](../../prompts/09-choose-a-theme.md)) delivers browsing, filtering and choosing a party theme (L2-023 and L2-024).

## Learning objectives

By the end, the viewer can:

- explain which themes are shown first and why some are tagged;
- use the age, outdoor and budget filters;
- choose a theme and undo it;
- say which parts of the plan follow the theme.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Which themes show first? | Those whose age range includes the child's age, with "For <child> (<age>)" on |
| Why is a theme tagged? | Giddy's memories of the child mention one of its tags |
| How long can a choice be undone? | Eight seconds, restoring the previous theme or none |
| What follows the theme? | The invitation draft and Fun & food's theme filter |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/Giddy.Application/Themes/` | listing and choosing themes |
| `backend/src/Giddy.Domain/Catalogue/ThemeProfile.cs` | ages, outdoor, budget |
| `frontend/projects/themes/` | the themes page |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:35 | Introduction, promises | What themes guarantee |
| 00:35-01:10 | Browsing | Age, tags, filters, empty state |
| 01:10-01:35 | Choosing | Chosen for Zuri, Undo |
| 01:35-02:15 | Tests, recap | API and browser coverage |

## Demo commands

```sh
dotnet test backend/Giddy.slnx
cd frontend && npx playwright test themes
```

## Pitfalls

- The demo catalogue has 13 themes; the design's 40 wait for an editorial process.
- Interest tags come from what Giddy remembers in chat; a family with no memories sees no tags.

## References

- [WAI-ARIA: toggle buttons](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [WCAG 2.2: timing adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)
