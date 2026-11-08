# Magic Patterns design source

The source of Giddy's brand, as designed in Magic Patterns ("Giddy Kids Party Planning"):
https://www.magicpatterns.com/os/vTiRTk3KcXBkGhfiB5ipq7/6peTuevdwvL4fqmi2RJLbJ

Captured on 8 Nov 2026 from the shared, read-only view. The files are kept exactly as Magic Patterns holds them (React + Tailwind); they are reference material, not part of the build.

| File | Magic Patterns frame | Implemented in |
| --- | --- | --- |
| `shared/brand/Logo.tsx` | Shared logo system: `Wordmark`, `BalloonSymbol`, `AppIcon` | `docs/design-system/foundations/logo.html`, `docs/design-system/assets/brand/`, the components library's `giddy-wordmark` and `giddy-logo-mark` |
| `logo-and-wordmark/index.tsx` | Giddy Logo & Wordmark | `docs/design-system/foundations/logo.html` |
| `logo-and-wordmark/index.css` | Brand tokens and fonts (shared by both frames) | `docs/design-system/tokens/tokens.css` (`--palette-*`, `--font-family-display`, `--font-family-sans`) |
| `brand-guidelines/index.tsx` | Giddy Brand Guidelines | `docs/design-system/foundations/brand.html`, plus the Typography, Color and Content foundations |
| `brand-guidelines/components/Mascot.tsx` | Giddy the balloon, four moods | `docs/design-system/components/mascot.html` |

When the Magic Patterns design changes, refresh these files and bring the design system in line in the same change.
