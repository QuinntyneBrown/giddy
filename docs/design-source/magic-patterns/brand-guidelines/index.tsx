import React from 'react'
import { X, Check } from 'lucide-react'

import { AppIcon, BalloonSymbol, Wordmark } from '@shared/brand/Logo'
import { Mascot, type Mood } from './components/Mascot'

export const args = {
  intro:
    'Giddy is an agentic birthday planner for families in Toronto and the GTA. These pages cover how Giddy looks and sounds, so every screen, invitation and email feels like it came from the same friend.',
  showMisuse: true,
  childName: 'Maya',
}

export const argTypes = {
  intro: { control: 'text' },
  showMisuse: { control: 'boolean' },
  childName: { control: 'text' },
}

type Props = Partial<typeof args>

export default function BrandGuidelines(props: Props) {
  const { intro, showMisuse, childName } = { ...args, ...props }

  return (
    <div className="bg-cream-50 font-sans text-ink">
      <div className="mx-auto grid max-w-[1280px] lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Side nav */}
        <nav aria-label="Guidelines" className="hidden border-r border-cream-200 lg:block">
          <div className="sticky top-0 flex flex-col gap-8 px-8 py-10">
            <Wordmark height={36} />
            <ul className="space-y-1 text-[15px]">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    className="block rounded-lg px-3 py-1.5 text-ink-muted transition-colors duration-150 hover:bg-cream-100 hover:text-grape-700"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="min-w-0">
          {/* Cover */}
          <header className="border-b border-cream-200 px-6 pb-16 pt-14 md:px-14 md:pt-20">
            <Wordmark height={132} className="h-auto w-[180px] md:w-[272px]" />
            <h1 className="mt-10 font-display text-5xl font-extrabold leading-[1.05] text-grape-900 md:text-7xl">
              Brand guidelines
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">{intro}</p>
          </header>

          {/* Idea */}
          <Section id="idea" title="The idea">
            <div className="grid gap-10 md:grid-cols-[1.1fr_1fr]">
              <p className="font-display text-3xl font-bold leading-snug text-grape-900 md:text-4xl">
                Giddy is the fizzy, can't-sit-still feeling a kid has on the morning of their birthday. Our job
                is to give parents that feeling instead of the to-do list.
              </p>
              <dl className="divide-y divide-cream-200 border-y border-cream-200">
                {PRINCIPLES.map((p) => (
                  <div key={p.term} className="py-4">
                    <dt className="font-display text-lg font-bold text-ink">{p.term}</dt>
                    <dd className="mt-1 text-[15px] leading-relaxed text-ink-muted">{p.body}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Section>

          {/* Logo */}
          <Section id="logo" title="Logo" lede="Two pieces: the wordmark leads, the balloon symbol stands in when space is tight.">
            <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
              <figure className="flex flex-col">
                <div className="flex aspect-[16/10] items-center justify-center rounded-3xl bg-cream-100">
                  <Wordmark height={132} className="h-auto w-[55%]" />
                </div>
                <figcaption className="mt-3 text-sm text-ink-muted">
                  <b className="text-ink">Wordmark.</b> The default on every surface that has room for it.
                </figcaption>
              </figure>
              <figure className="flex flex-col">
                <div className="flex aspect-[16/10] items-center justify-center gap-6 rounded-3xl bg-grape-50 md:aspect-auto md:flex-1">
                  <BalloonSymbol size={128} />
                  <AppIcon size={88} />
                </div>
                <figcaption className="mt-3 text-sm text-ink-muted">
                  <b className="text-ink">Symbol and app icon.</b> Avatars, favicons, the chat agent.
                </figcaption>
              </figure>
            </div>

            <div className="mt-12 grid gap-10 md:grid-cols-2">
              <div>
                <h3 className="font-display text-xl font-bold text-ink">Clear space</h3>
                <p className="mt-1 text-[15px] text-ink-muted">
                  Keep a margin equal to the balloon's height, <b className="text-ink">x</b>, on every side.
                </p>
                <div className="mt-6 flex items-center justify-center rounded-2xl bg-cream-100 p-6">
                  <div className="relative border border-dashed border-grape-300 p-[22px]">
                    <div className="border border-grape-200/70">
                      <Wordmark height={100} className="block" />
                    </div>
                    <span className="absolute left-1/2 top-0.5 -translate-x-1/2 font-display text-sm font-bold text-grape-600">x</span>
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 font-display text-sm font-bold text-grape-600">x</span>
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 font-display text-sm font-bold text-grape-600">x</span>
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 font-display text-sm font-bold text-grape-600">x</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-ink">Minimum size</h3>
                <p className="mt-1 text-[15px] text-ink-muted">
                  Below these the balloon stops reading as a balloon. Shown at actual size.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-cream-200">
                  <MinSize label="Wordmark, screen" spec="24px tall">
                    <Wordmark height={24} />
                  </MinSize>
                  <MinSize label="Wordmark, print" spec="10mm tall">
                    <Wordmark height={38} />
                  </MinSize>
                  <MinSize label="Symbol" spec="20px · face from 24px">
                    <BalloonSymbol size={20} simple />
                  </MinSize>
                  <MinSize label="App icon" spec="16px favicon">
                    <AppIcon size={16} />
                  </MinSize>
                </div>
              </div>
            </div>

            {showMisuse && (
              <div className="mt-14">
                <h3 className="font-display text-xl font-bold text-ink">Please don't</h3>
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                  {MISUSE.map((m) => (
                    <figure key={m.label} className="flex flex-col">
                      <div className={`flex aspect-[3/2] items-center justify-center overflow-hidden rounded-2xl ${m.bg}`}>
                        <div style={m.style}>
                          <Wordmark height={52} ink={m.ink} tittle={m.tittle} />
                        </div>
                      </div>
                      <figcaption className="mt-2.5 flex items-start gap-2 text-sm text-ink">
                        <X aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={2.5} />
                        {m.label}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Colour */}
          <Section id="colour" title="Colour" lede="Grape leads, cream gives it room to breathe, and the party pops are confetti: a little goes a long way.">
            <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
              <div className="flex min-h-[280px] flex-col justify-between rounded-3xl bg-grape-600 p-7 text-cream-50">
                <span className="font-display text-3xl font-extrabold">Grape 600</span>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <dt className="text-grape-100">Hex</dt>
                  <dd className="font-mono">#6C2FE0</dd>
                  <dt className="text-grape-100">Use</dt>
                  <dd>Logo, primary buttons, selected states</dd>
                  <dt className="text-grape-100">Contrast</dt>
                  <dd>6.4:1 with cream text</dd>
                </dl>
              </div>
              <div className="grid gap-4">
                <Swatch name="Cream 50" hex="#FFF9F1" use="Page canvas" className="bg-cream-50 text-ink ring-1 ring-inset ring-cream-200" />
                <Swatch name="Grape 700" hex="#5A22C4" use="Wordmark, links · 8.1:1 on cream" className="bg-grape-700 text-cream-50" />
                <Swatch name="Night 950" hex="#130E22" use="Dark theme canvas" className="bg-night-950 text-cream-50" />
              </div>
            </div>

            <h3 className="mt-12 font-display text-xl font-bold text-ink">Party pops</h3>
            <p className="mt-1 text-[15px] text-ink-muted">
              Decorative only: kid avatars, theme tiles, confetti, the balloon tittle. Each comes as a tint, a solid and
              a text colour that passes AA on its tint.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {POPS.map((p) => (
                <div key={p.name} className={`flex flex-col gap-6 rounded-2xl p-4 ${p.tint}`}>
                  <span className={`size-10 rounded-full ${p.solid}`} />
                  <div>
                    <span className={`block font-display text-lg font-bold ${p.text}`}>{p.name}</span>
                    <span className={`font-mono text-xs ${p.text}`}>{p.hex}</span>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="mt-12 font-display text-xl font-bold text-ink">Proportion</h3>
            <div className="mt-4 flex h-14 overflow-hidden rounded-2xl text-sm font-semibold">
              <div className="flex w-[60%] items-center bg-cream-100 px-4 text-ink">Cream 60%</div>
              <div className="flex w-[25%] items-center bg-grape-600 px-4 text-cream-50">Grape 25%</div>
              <div className="flex w-[10%] items-center justify-center bg-ink text-cream-50">10</div>
              <div className="flex w-[5%]">
                <span className="flex-1 bg-sun-400" />
                <span className="flex-1 bg-pink-400" />
                <span className="flex-1 bg-mint-400" />
              </div>
            </div>
            <p className="mt-2 text-sm text-ink-muted">Ink takes 10%, pops share the last 5%.</p>
          </Section>

          {/* Type */}
          <Section id="type" title="Typography" lede="Two rounded faces. Baloo 2 brings the toy-box warmth to headlines; Nunito keeps long reads easy.">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-grape-50 p-7">
                <span className="font-display text-8xl font-extrabold leading-none text-grape-700">Aa</span>
                <p className="mt-6 font-display text-2xl font-bold text-ink">Baloo 2</p>
                <p className="text-sm text-ink-muted">Display and headings · 700–800</p>
              </div>
              <div className="rounded-3xl bg-cream-100 p-7">
                <span className="text-8xl font-bold leading-none text-ink">Aa</span>
                <p className="mt-6 text-2xl font-bold text-ink">Nunito</p>
                <p className="text-sm text-ink-muted">Body, labels, UI · 400–700</p>
              </div>
            </div>

            <table className="mt-10 w-full text-left">
              <tbody className="divide-y divide-cream-200">
                {TYPE_SCALE.map((t) => (
                  <tr key={t.role}>
                    <td className="w-28 py-4 pr-4 align-baseline text-sm text-ink-muted md:w-40">
                      {t.role}
                      <span className="block font-mono text-xs">{t.spec}</span>
                    </td>
                    <td className={`py-4 align-baseline ${t.className}`}>
                      {t.sample.replace('{name}', childName)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-ink-muted">
              Sentence case everywhere. Nothing smaller than 12px. In product, both fall back to the rounded system
              stack (SF Pro Rounded) so no font has to download.
            </p>
          </Section>

          {/* Mascot */}
          <Section id="mascot" title="Giddy the balloon" lede="Giddy has four moods, and each one has a job. Never invent a fifth.">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
              {MOODS.map((m) => (
                <figure key={m.mood} className="flex flex-col">
                  <div className={`flex aspect-square items-center justify-center rounded-3xl ${m.bg}`}>
                    <Mascot mood={m.mood} size={130} />
                  </div>
                  <figcaption className="mt-3">
                    <span className="block font-display text-lg font-bold text-ink">{m.name}</span>
                    <span className="text-sm leading-snug text-ink-muted">{m.use}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-8 text-[15px] text-ink-muted">
              Giddy is an "it" and is always called by name. Label the art for screen readers ("Giddy looking worried"),
              or hide it when the text beside it says the same.
            </p>
          </Section>

          {/* Voice */}
          <Section id="voice" title="Voice" lede="A helpful friend who happens to be great at parties. Lead with the answer, use real names and numbers, and save the fun for the art.">
            <div className="overflow-hidden rounded-2xl border border-cream-200">
              <div className="hidden grid-cols-[160px_1fr_1fr] bg-cream-100 text-sm font-semibold text-ink-muted md:grid">
                <span className="px-5 py-3">When we're</span>
                <span className="px-5 py-3">We say</span>
                <span className="px-5 py-3">Not</span>
              </div>
              {VOICE.map((v) => (
                <div key={v.trait} className="grid gap-2 border-t border-cream-200 bg-white px-5 py-4 first:border-t-0 md:grid-cols-[160px_1fr_1fr] md:gap-0 md:p-0 md:first:border-t">
                  <span className="font-display font-bold text-ink md:px-5 md:py-4">{v.trait}</span>
                  <span className="flex gap-2 text-[15px] text-ink md:px-5 md:py-4">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={2.5} />
                    {v.say.replace('{name}', childName)}
                  </span>
                  <span className="flex gap-2 text-[15px] text-ink-muted md:px-5 md:py-4">
                    <X aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={2.5} />
                    {v.not}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-ink-muted">
              Buttons are verbs with the specifics in them: "Book 1:00–3:30 pm", "Send to 16 families". Never OK or Submit.
            </p>
          </Section>

          {/* Applications */}
          <Section id="applications" title="In use" lede="How the pieces come together on the two surfaces families see most.">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
              <div className="overflow-hidden rounded-3xl border border-cream-200 bg-cream-50">
                <div className="flex items-center justify-between gap-3 border-b border-cream-200 bg-white px-5 py-3">
                  <Wordmark height={30} />
                  <button className="whitespace-nowrap rounded-full bg-grape-600 px-4 py-2 text-sm font-bold text-cream-50 shadow-[0_3px_0_var(--color-grape-800)] transition-[transform,box-shadow] duration-100 active:translate-y-[3px] active:shadow-none">
                    Plan a party
                  </button>
                </div>
                <div className="flex items-start gap-3 p-5">
                  <BalloonSymbol size={36} />
                  <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 text-[15px] leading-relaxed shadow-sm ring-1 ring-cream-200">
                    Dino Den in Leslieville is free Sat 14 Nov, 1:00–3:30 pm, and has a nut-free kitchen. Room for 16
                    kids, $340 all in. Want me to hold it?
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 px-5 pb-5 pl-[68px]">
                  <span className="rounded-full bg-grape-600 px-4 py-2 text-sm font-bold text-cream-50">Hold Sat 14 Nov</span>
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-grape-700 ring-1 ring-inset ring-grape-200">
                    Show 2 more
                  </span>
                </div>
              </div>

              <div className="flex flex-col overflow-hidden rounded-3xl bg-grape-600 text-cream-50">
                <div className="flex flex-1 flex-col items-center gap-3 px-6 pb-8 pt-10 text-center">
                  <Mascot mood="party" size={110} />
                  <p className="mt-2 font-display text-sm font-semibold text-grape-100">You're invited</p>
                  <p className="font-display text-4xl font-extrabold leading-tight">{childName} is turning 7!</p>
                  <p className="text-[15px] text-grape-100">Sat 14 Nov · 1:00–3:30 pm · Dino Den, Leslieville</p>
                  <span className="mt-4 rounded-full bg-sun-400 px-6 py-2.5 font-bold text-sun-800">RSVP by 7 Nov</span>
                </div>
                <div className="flex items-center justify-center gap-2 bg-grape-700 py-3 text-xs text-grape-100">
                  Planned with <Wordmark height={18} ink="var(--color-cream-50)" tittle="var(--color-sun-400)" />
                </div>
              </div>
            </div>
          </Section>

          <footer className="px-6 py-10 text-sm text-ink-muted md:px-14">
            Giddy brand guidelines v1.0 · Tokens mirror docs/design-system/tokens/tokens.css
          </footer>
        </main>
      </div>
    </div>
  )
}

function Section({
  id,
  title,
  lede,
  children,
}: {
  id: string
  title: string
  lede?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-6 border-b border-cream-200 px-6 py-16 md:px-14">
      <h2 className="font-display text-3xl font-extrabold text-grape-900 md:text-4xl">{title}</h2>
      {lede && <p className="mt-2 max-w-2xl text-[17px] leading-relaxed text-ink-muted">{lede}</p>}
      <div className="mt-10">{children}</div>
    </section>
  )
}

function MinSize({ label, spec, children }: { label: string; spec: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 bg-cream-50 p-5">
      <div className="flex h-10 items-end">{children}</div>
      <div>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="text-xs text-ink-muted">{spec}</span>
      </div>
    </div>
  )
}

function Swatch({ name, hex, use, className }: { name: string; hex: string; use: string; className: string }) {
  return (
    <div className={`flex items-end justify-between gap-4 rounded-2xl p-5 ${className}`}>
      <div>
        <span className="block font-display text-lg font-bold">{name}</span>
        <span className="text-sm opacity-80">{use}</span>
      </div>
      <span className="font-mono text-sm">{hex}</span>
    </div>
  )
}

const NAV = [
  { id: 'idea', label: 'The idea' },
  { id: 'logo', label: 'Logo' },
  { id: 'colour', label: 'Colour' },
  { id: 'type', label: 'Typography' },
  { id: 'mascot', label: 'Giddy the balloon' },
  { id: 'voice', label: 'Voice' },
  { id: 'applications', label: 'In use' },
]

const PRINCIPLES = [
  { term: 'Calm in the planning', body: 'Parents arrive stressed. Screens stay quiet, clear and cream so the decisions feel small.' },
  { term: 'Joy in the party', body: 'Colour, confetti and the mascot show up at the milestones: a booking, an RSVP, the big day.' },
  { term: 'Specific beats cute', body: 'A real venue, a real time, a real price is more delightful than any exclamation mark.' },
]

const MISUSE: {
  label: string
  bg: string
  ink?: string
  tittle?: string
  style?: React.CSSProperties
}[] = [
  { label: 'Stretch or squash it', bg: 'bg-cream-100', style: { transform: 'scaleX(1.45)' } },
  { label: 'Recolour the letters', bg: 'bg-cream-100', ink: 'var(--color-sky-400)', tittle: 'var(--color-mint-400)' },
  { label: 'Pop the balloon', bg: 'bg-cream-100', tittle: 'transparent' },
  { label: 'Tilt the wordmark', bg: 'bg-cream-100', style: { transform: 'rotate(-12deg)' } },
  { label: 'Add shadows or effects', bg: 'bg-cream-100', style: { filter: 'drop-shadow(4px 4px 0 var(--color-pink-400))' } },
  { label: 'Place it on low contrast', bg: 'bg-grape-600', ink: 'var(--color-grape-700)' },
]

const POPS = [
  { name: 'Sun', hex: '#FFC93C', tint: 'bg-sun-100', solid: 'bg-sun-400', text: 'text-sun-800' },
  { name: 'Pink', hex: '#FF6FA8', tint: 'bg-pink-100', solid: 'bg-pink-400', text: 'text-pink-800' },
  { name: 'Mint', hex: '#3CCFA0', tint: 'bg-mint-100', solid: 'bg-mint-400', text: 'text-mint-800' },
  { name: 'Sky', hex: '#4CB8FF', tint: 'bg-sky-100', solid: 'bg-sky-400', text: 'text-sky-800' },
  { name: 'Orange', hex: '#FF8A3D', tint: 'bg-orange-100', solid: 'bg-orange-400', text: 'text-orange-800' },
]

const TYPE_SCALE = [
  { role: 'Display', spec: '48 / 800', sample: '{name} turns 7!', className: 'font-display text-4xl font-extrabold leading-tight text-grape-900 md:text-5xl' },
  { role: 'Heading 1', spec: '36 / 800', sample: 'Your party plan', className: 'font-display text-3xl font-extrabold text-ink md:text-4xl' },
  { role: 'Heading 2', spec: '30 / 700', sample: 'Venues near Leslieville', className: 'font-display text-2xl font-bold text-ink md:text-3xl' },
  { role: 'Heading 3', spec: '24 / 700', sample: '12 of 16 families replied', className: 'font-display text-2xl font-bold text-ink' },
  { role: 'Body', spec: '16 / 400', sample: "Two guests have nut allergies, so we've kept the cake and loot bags nut-free.", className: 'text-base text-ink' },
  { role: 'Caption', spec: '12 / 400', sample: 'Sat 14 Nov · in 20 days · $340', className: 'text-xs text-ink-muted' },
]

const MOODS: { mood: Mood; name: string; use: string; bg: string }[] = [
  { mood: 'happy', name: 'Happy', use: 'Chat, greetings, the agent avatar', bg: 'bg-grape-50' },
  { mood: 'party', name: 'Party', use: 'Bookings confirmed, first run, invitations', bg: 'bg-sun-100' },
  { mood: 'sleepy', name: 'Sleepy', use: 'Empty states, no results, 404', bg: 'bg-sky-100' },
  { mood: 'worried', name: 'Worried', use: "Errors, and only when something didn't work", bg: 'bg-orange-100' },
]

const VOICE = [
  { trait: 'Friendly', say: 'Who are we celebrating?', not: 'Please enter child profile details.' },
  { trait: 'Specific', say: 'Dino Den is free that Saturday and has a nut-free kitchen.', not: 'We found amazing options for your little one!!' },
  { trait: 'Reassuring', say: 'Your plans are safe. Try again in a minute.', not: 'Oops! Something went terribly wrong.' },
  { trait: 'Celebratory', say: 'Yay! Ethan is coming.', not: 'RSVP status updated to: Attending.' },
]
