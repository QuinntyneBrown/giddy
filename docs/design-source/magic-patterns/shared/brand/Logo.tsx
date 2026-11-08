import React from 'react'

/**
 * Giddy logo system.
 *
 * - Wordmark: custom monoline "giddy" built from round strokes, whose i is
 *   dotted with a tiny balloon. This is the primary logo.
 * - Symbol: the smiling grape balloon, for app icons, avatars and favicons.
 * - AppIcon: the symbol knocked out on a grape tile.
 *
 * Colours default to theme tokens so every sheet stays in step with index.css.
 */

/** The balloon body, drawn in a 48 × 64 box. Shared by the symbol and the tittle. */
const BALLOON_BODY =
  'M24 3C12.4 3 5 12 5 22.5 5 35 15.5 44 24 44s19-9 19-21.5C43 12 35.6 3 24 3z'
const BALLOON_KNOT = 'M20.5 43.5h7l-1.6 4.2h-3.8z'
const BALLOON_STRING = 'M24 47.7c0 4-4.2 5-3.2 9s4.6 3.4 3.8 6.8'

type WordmarkProps = {
  /** Rendered height in px. Width follows the 272 × 132 artwork. */
  height?: number
  ink?: string
  tittle?: string
  title?: string
  className?: string
}

export function Wordmark({
  height = 64,
  ink = 'var(--color-grape-700)',
  tittle = 'var(--color-pink-400)',
  title = 'Giddy',
  className,
}: WordmarkProps) {
  const width = (height * 272) / 132
  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 4 272 132"
      width={width}
      height={height}
      className={className}
    >
      <g fill="none" stroke={ink} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round">
        {/* g */}
        <circle cx={26} cy={74} r={19.5} />
        <path d="M45.5 54.5V108q0 20-19.5 20-11 0-17-6" />
        {/* ı */}
        <path d="M70.5 54.5v39" />
        {/* d */}
        <circle cx={115} cy={74} r={19.5} />
        <path d="M134.5 26.5v67" />
        {/* d */}
        <circle cx={179} cy={74} r={19.5} />
        <path d="M198.5 26.5v67" />
        {/* y */}
        <path d="M223.5 54.5V74a19.5 19.5 0 0 0 39 0" />
        <path d="M262.5 54.5V108q0 20-19.5 20-11 0-17-6" />
      </g>
      {/* The balloon tittle */}
      <g transform="translate(57.3 5) scale(0.55)">
        <path d={BALLOON_BODY} fill={tittle} />
        <path d={BALLOON_KNOT} fill={tittle} />
        <path
          d={BALLOON_STRING}
          fill="none"
          stroke={tittle}
          strokeWidth={4}
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

type SymbolProps = {
  size?: number
  body?: string
  face?: string
  cheek?: string
  string?: string
  /** Drop the smile and cheeks below 24px, where they turn to noise. */
  simple?: boolean
  title?: string
  className?: string
}

export function BalloonSymbol({
  size = 64,
  body = 'var(--color-grape-600)',
  face = 'var(--color-cream-50)',
  cheek = 'var(--color-pink-400)',
  string,
  simple = false,
  title = 'Giddy',
  className,
}: SymbolProps) {
  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 48 64"
      width={(size * 48) / 64}
      height={size}
      className={className}
    >
      <path d={BALLOON_BODY} fill={body} />
      <path d={BALLOON_KNOT} fill={body} />
      <path
        d={BALLOON_STRING}
        fill="none"
        stroke={string ?? body}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <ellipse
        cx={14.5}
        cy={14.5}
        rx={3}
        ry={5.6}
        transform="rotate(-28 14.5 14.5)"
        fill={face}
        opacity={0.55}
      />
      {!simple && (
        <>
          <circle cx={18.5} cy={20.5} r={2.1} fill={face} />
          <circle cx={29.5} cy={20.5} r={2.1} fill={face} />
          <circle cx={13.5} cy={28} r={2.6} fill={cheek} />
          <circle cx={34.5} cy={28} r={2.6} fill={cheek} />
          <path
            d="M18 26.5q6 6 12 0"
            fill="none"
            stroke={face}
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  )
}

type AppIconProps = {
  size?: number
  tile?: string
  className?: string
}

export function AppIcon({ size = 96, tile = 'var(--color-grape-600)', className }: AppIconProps) {
  return (
    <div
      className={`flex items-center justify-center ${className ?? ''}`}
      style={{ width: size, height: size, background: tile, borderRadius: size * 0.225 }}
    >
      <BalloonSymbol
        size={size * 0.68}
        body="var(--color-cream-50)"
        face="var(--color-grape-600)"
        cheek="var(--color-pink-400)"
        simple={size < 32}
        title="Giddy app icon"
      />
    </div>
  )
}
