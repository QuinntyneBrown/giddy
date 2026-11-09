import React from 'react'

export type Mood = 'happy' | 'party' | 'sleepy' | 'worried'

/** Giddy the balloon, in one of four moods. Adapted from docs/design-system/components/mascot.html. */
export function Mascot({ mood, size = 120 }: { mood: Mood; size?: number }) {
  const { body, face } = PALETTE[mood]
  return (
    <svg
      role="img"
      aria-label={`Giddy looking ${LABEL[mood]}`}
      viewBox="0 -12 64 84"
      width={(size * 64) / 84}
      height={size}
    >
      <path d="M32 4C19 4 10 13.5 10 26c0 14 12 24 22 24s22-10 22-24C54 13.5 45 4 32 4z" fill={body} />
      <path d="M28.5 49.5h7l-1.6 4h-3.8z" fill={body} />
      <path
        d="M32 53.5c0 4-4 5-3 9s4.5 3.5 3.6 7"
        fill="none"
        stroke={body}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <ellipse cx={20} cy={15} rx={3.6} ry={6.4} transform="rotate(-28 20 15)" fill="#fff" opacity={0.45} />

      {mood !== 'sleepy' && (
        <>
          <circle cx={25} cy={26} r={2.8} fill={face} />
          <circle cx={39} cy={26} r={2.8} fill={face} />
        </>
      )}
      {mood !== 'worried' && (
        <>
          <circle cx={19} cy={33} r={3.4} fill="var(--color-pink-400)" opacity={mood === 'sleepy' ? 0.6 : 1} />
          <circle cx={45} cy={33} r={3.4} fill="var(--color-pink-400)" opacity={mood === 'sleepy' ? 0.6 : 1} />
        </>
      )}

      {mood === 'happy' && (
        <path d="M25 33.5q7 7 14 0" fill="none" stroke={face} strokeWidth={2.8} strokeLinecap="round" />
      )}

      {mood === 'party' && (
        <>
          <path d="M24 32.5q8 10 16 0z" fill={face} strokeLinejoin="round" stroke={face} strokeWidth={1.5} />
          <path d="M23 7.5 32-9l9 16.5z" fill="var(--color-sun-400)" />
          <path d="M26.5 1.5l11-1.5M29 -4l6-1" stroke="var(--color-pink-400)" strokeWidth={2} strokeLinecap="round" />
          <circle cx={32} cy={-9} r={3} fill="var(--color-pink-400)" />
        </>
      )}

      {mood === 'sleepy' && (
        <>
          <path d="M21 26q4 3.5 8 0M35 26q4 3.5 8 0" fill="none" stroke={face} strokeWidth={2.6} strokeLinecap="round" />
          <ellipse cx={32} cy={35} rx={2.6} ry={3} fill={face} />
          <path d="M48 -2h6l-6 7h6M55 -10h4l-4 5h4" fill="none" stroke="var(--color-sky-800)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {mood === 'worried' && (
        <>
          <path d="M20.5 19.5l7-2.5M43.5 19.5l-7-2.5" stroke={face} strokeWidth={2.4} strokeLinecap="round" />
          <path d="M24 37q4-4 8 0t8 0" fill="none" stroke={face} strokeWidth={2.6} strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

const PALETTE: Record<Mood, { body: string; face: string }> = {
  happy: { body: 'var(--color-grape-600)', face: 'var(--color-cream-50)' },
  party: { body: 'var(--color-grape-600)', face: 'var(--color-cream-50)' },
  sleepy: { body: 'var(--color-sky-400)', face: 'var(--color-night-950)' },
  worried: { body: 'var(--color-orange-400)', face: 'var(--color-night-950)' },
}

const LABEL: Record<Mood, string> = {
  happy: 'happy',
  party: 'ready to party',
  sleepy: 'sleepy',
  worried: 'worried',
}
