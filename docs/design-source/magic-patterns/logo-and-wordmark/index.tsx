import React from 'react'

import { AppIcon, BalloonSymbol, Wordmark } from '@shared/brand/Logo'

export const args = {
  background: 'cream',
  showConstruction: true,
  tagline: 'Party planning that feels like a party.',
}

export const argTypes = {
  background: { control: 'radio', options: ['cream', 'grape', 'night'] },
  showConstruction: { control: 'boolean' },
  tagline: { control: 'text' },
}

type Props = Partial<typeof args>

export default function LogoSheet(props: Props) {
  const { background, showConstruction, tagline } = { ...args, ...props }
  const hero = HEROES[background as keyof typeof HEROES] ?? HEROES.cream

  return (
    <main className="bg-cream-50 font-sans text-ink">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-cream-200 px-6 py-5 md:px-12">
        <div className="flex items-center gap-3">
          <BalloonSymbol size={28} simple />
          <span className="font-display text-lg font-bold text-grape-900">Logo & wordmark</span>
        </div>
        <span className="text-sm text-ink-muted">Giddy brand · v1.0</span>
      </header>

      {/* Primary logo */}
      <section className={`px-6 py-16 md:px-12 md:py-24 ${hero.bg}`}>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <Wordmark
            height={200}
            ink={hero.ink}
            tittle={hero.tittle}
            className="h-auto w-full max-w-[412px]"
          />
          <p className={`font-display text-xl font-semibold md:text-2xl ${hero.text}`}>{tagline}</p>
        </div>
      </section>

      {/* Construction */}
      {showConstruction && (
        <section className="grid gap-10 px-6 py-16 md:px-12 lg:grid-cols-[1fr_340px] lg:items-center">
          <div className="relative mx-auto w-full max-w-[560px]">
            {GUIDES.map((g) => (
              <div
                key={g.label}
                className="absolute inset-x-0 border-t border-dashed border-grape-300"
                style={{ top: `${g.top}%` }}
              >
                <span className="absolute -top-2.5 right-full mr-3 hidden whitespace-nowrap text-xs text-ink-muted sm:block">
                  {g.label}
                </span>
              </div>
            ))}
            <Wordmark height={272} className="relative h-auto w-full" />
          </div>
          <div className="space-y-4 text-[15px] leading-relaxed text-ink-muted">
            <h2 className="font-display text-2xl font-bold text-grape-900">How it's built</h2>
            <p>
              Every letter is one 13-unit round stroke: the bowls of the <b className="text-ink">g</b> and{' '}
              <b className="text-ink">d</b> are perfect circles, and every terminal is round, so the word
              reads soft at any size.
            </p>
            <p>
              The dot of the <b className="text-ink">i</b> is a balloon that has just let go. It is the only
              colour in the wordmark and the only part allowed to tilt toward joy.
            </p>
            <p>Lowercase, always. Giddy is a friend, not an institution.</p>
          </div>
        </section>
      )}

      {/* Symbol and app icon */}
      <section className="grid gap-px border-y border-cream-200 bg-cream-200 md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-8 bg-grape-50 px-6 py-12 md:px-12">
          <div>
            <h2 className="font-display text-2xl font-bold text-grape-900">Symbol</h2>
            <p className="mt-1 max-w-sm text-[15px] text-ink-muted">
              The smiling balloon. Use it where the wordmark won't fit: avatars, favicons, the chat agent.
            </p>
          </div>
          <div className="flex flex-1 flex-wrap items-end gap-6 sm:gap-8">
            <BalloonSymbol size={180} />
            <BalloonSymbol size={96} />
            <BalloonSymbol size={48} />
            <BalloonSymbol size={20} simple />
          </div>
        </div>
        <div className="flex flex-col gap-8 bg-cream-50 px-6 py-12 md:px-12">
          <div>
            <h2 className="font-display text-2xl font-bold text-grape-900">App icon</h2>
            <p className="mt-1 max-w-sm text-[15px] text-ink-muted">
              Cream balloon on a grape tile. The face drops below 32px.
            </p>
          </div>
          <div className="flex flex-1 flex-wrap items-end gap-6">
            <AppIcon size={120} />
            <AppIcon size={64} />
            <AppIcon size={40} />
            <AppIcon size={24} />
          </div>
        </div>
      </section>

      {/* Colourways */}
      <section className="px-6 py-16 md:px-12">
        <h2 className="font-display text-2xl font-bold text-grape-900">Colourways</h2>
        <p className="mt-1 text-[15px] text-ink-muted">Four approved versions. Pick by background, never by mood.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLOURWAYS.map((c) => (
            <figure key={c.name} className="flex flex-col">
              <div className={`flex aspect-[4/3] items-center justify-center rounded-2xl ${c.bg}`}>
                <Wordmark height={72} ink={c.ink} tittle={c.tittle} />
              </div>
              <figcaption className="mt-3">
                <span className="block font-display text-base font-bold text-ink">{c.name}</span>
                <span className="text-sm text-ink-muted">{c.use}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  )
}

const HEROES = {
  cream: {
    bg: 'bg-cream-100',
    ink: 'var(--color-grape-700)',
    tittle: 'var(--color-pink-400)',
    text: 'text-grape-900',
  },
  grape: {
    bg: 'bg-grape-600',
    ink: 'var(--color-cream-50)',
    tittle: 'var(--color-sun-400)',
    text: 'text-cream-50',
  },
  night: {
    bg: 'bg-night-950',
    ink: 'var(--color-cream-50)',
    tittle: 'var(--color-pink-400)',
    text: 'text-grape-200',
  },
}

// Guide positions as a % of the wordmark's 132-unit-tall artwork (viewBox y 4–136).
const GUIDES = [
  { label: 'Ascender', top: ((20 - 4) / 132) * 100 },
  { label: 'x-height', top: ((48 - 4) / 132) * 100 },
  { label: 'Baseline', top: ((100 - 4) / 132) * 100 },
  { label: 'Descender', top: ((134.5 - 4) / 132) * 100 },
]

const COLOURWAYS = [
  {
    name: 'Primary',
    use: 'Cream and white backgrounds',
    bg: 'bg-cream-50 ring-1 ring-inset ring-cream-200',
    ink: 'var(--color-grape-700)',
    tittle: 'var(--color-pink-400)',
  },
  {
    name: 'Reversed',
    use: 'Grape 600 and darker grapes',
    bg: 'bg-grape-600',
    ink: 'var(--color-cream-50)',
    tittle: 'var(--color-sun-400)',
  },
  {
    name: 'Night',
    use: 'Dark theme and night-sky surfaces',
    bg: 'bg-night-950',
    ink: 'var(--color-cream-50)',
    tittle: 'var(--color-pink-400)',
  },
  {
    name: 'One colour',
    use: 'Print, embossing, single-ink jobs',
    bg: 'bg-sun-100',
    ink: 'var(--color-ink)',
    tittle: 'var(--color-ink)',
  },
]
