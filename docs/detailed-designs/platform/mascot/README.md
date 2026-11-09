# Giddy the balloon

## Overview

Giddy, the balloon mascot, is redrawn to match the Magic Patterns frame "Giddy Brand Guidelines" exactly. The source is kept in [`docs/design-source/magic-patterns/brand-guidelines/components/Mascot.tsx`](../../../design-source/magic-patterns/brand-guidelines/components/Mascot.tsx).

- **mood**: one of `happy`, `party`, `sleepy` or `worried`; each has one job (see the [Brand](../../../design-system/foundations/brand.html#mascot) foundation)
- **artwork**: 64 × 84 units (`viewBox="0 -12 64 84"`), so the party hat and the sleepy z's fit above the balloon; width follows height

This feature belongs to the **Platform and cross-cutting concerns** subsystem, beside [Logo and wordmark](../brand-logo/README.md). It changes no API and no data.

## Description

A frontend-only change: new mascot role tokens, the mascot's classes in `components.css`, and the library's `svg[giddy-mascot]`.

**Design system (`docs/design-system`)**

- **Tokens.** `--color-mascot-face` (cream 50 light, grape 950 dark) for the happy and party face, `--color-mascot-face-on-pop` (night 950) for the sleepy and worried face, and `--color-mascot-shine` (white, drawn at 45%). The rest reuse existing roles: the balloon is `--color-accent`, `--color-pop-sky-solid` or `--color-pop-orange-solid`; cheeks and the hat's pom-pom and stripes `--color-pop-pink-solid`; the hat `--color-pop-sun-solid`; the z's `--color-pop-sky-fg`. Face-on-balloon pairs are held to 3:1 in `contrast-pairs.json`.
- **`components.css`.** `.mascot` takes its height from the size class and its width from the 64:84 aspect ratio. The knot and string take the balloon's colour, as in the source.
- **`components/mascot.html`** and every mock show the new art and the new names.

**Frontend: components library (`frontend/projects/components`)**

- **`MascotComponent`** (`svg[giddy-mascot]`). The template is the source's paths per mood; the host's `viewBox` becomes `0 -12 64 84`; the default names become "Giddy looking happy", "Giddy looking ready to party", "Giddy looking sleepy" and "Giddy looking worried". The `ariaLabel` input still overrides the name (for example the chat avatar's "Giddy").

**e2e (`frontend/e2e`)**

- `MascotPage` finds Giddy on a screen by its name and reads the balloon and face colours.
- `e2e/mascot.spec.ts` holds the acceptance tests: the names on the 404, 500 and marketing pages, and the colours in both themes. The existing axe checks on those screens cover AC4.

**Decisions.**

- **Names follow the source.** "Giddy looking …" replaces "Giddy the balloon", "Giddy celebrating" and the mock-only "Happy Giddy" style.
- **The dark theme departs from the source where it must.** The source has no dark theme; its grape 600 balloon is only 2.8:1 on the night canvas, so the happy and party balloon follow `--color-accent` (grape 300, 8.4:1) with a grape 950 face.
- **The shine is white in both themes**, as in the source, through its own role token.

## Requirements

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-097` | `L1-021` | **Giddy the balloon.** The mascot is drawn as in the Magic Patterns brand guidelines, named for its mood, in brand colours in the light theme and at least 3:1 in the dark theme. |
