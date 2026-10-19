import type { ReactNode } from 'react'
import { useSvgId } from './svgId'
import './panelart.css'

/**
 * The drawn scenes of the comic register (section 4c): the panels of the story strips and the
 * season cards. Ink line, the lilac tint with a halftone corner, crate brown, the plain figure
 * grey; no faces (the cast only appears as portraits) and nothing that marks a choice. Each is
 * a light inline SVG of a few shapes, decorative: the caption beside it carries the words.
 */
export type ArtKey =
  | 'crowd'
  | 'table'
  | 'crates'
  | 'letters'
  | 'chat'
  | 'note'
  | 'ledger'
  | 'coffee'
  | 'glance'
  | 'board'
  | 'backs'
  | 'truck'
  | 'dashboard'
  | 'warehouse'
  | 'newsroom'
  | 'clinic'

const W = 2.6
const r = (x: number, y: number, w: number, h: number, c: string, rx = 0) => (
  <rect
    x={x}
    y={y}
    width={w}
    height={h}
    rx={rx || undefined}
    className={`${c} pa-l`}
    strokeWidth={W}
  />
)
const s = (d: string, c: string, w = W) => (
  <path
    d={d}
    className={c}
    fill="none"
    strokeWidth={w}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
)
const fig = (x: number, y: number) => (
  <g key={`${x}-${y}`} transform={`translate(${x},${y})`}>
    <circle r="9" className="pa-fig pa-l" strokeWidth={2.4} />
    <rect x="-11" y="10" width="22" height="30" rx="9" className="pa-fig pa-l" strokeWidth={2.4} />
  </g>
)
const crate = (x: number, y: number, w = 38, h = 32) => (
  <g key={`${x}-${y}`}>
    {r(x, y, w, h, 'pa-crate')}
    {s(`M${x},${y + h / 3} H${x + w} M${x},${y + (2 * h) / 3} H${x + w}`, 'pa-s-ink', 2)}
  </g>
)
const envelope = (x: number, y: number, rot: number) => (
  <g key={`${x}-${y}`} transform={`rotate(${rot} ${x + 30} ${y + 20})`}>
    {r(x, y, 60, 40, 'pa-paper')}
    {s(`M${x},${y} L${x + 30},${y + 22} L${x + 60},${y}`, 'pa-s-ink', 2)}
  </g>
)

const WIDE = '0 0 340 120'
const SQUARE = '0 0 160 130'

const ART: Record<ArtKey, { box: string; tint: boolean; draw: () => ReactNode }> = {
  crowd: {
    box: WIDE,
    tint: true,
    draw: () => (
      <>
        {r(-4, 96, 348, 30, 'pa-paper')}
        {[...Array(9).keys()].map((i) => fig(30 + i * 36, 52 + (i % 2) * 10))}
      </>
    ),
  },
  table: {
    box: SQUARE,
    tint: false,
    draw: () => (
      <>
        {r(14, 70, 132, 10, 'pa-paper')}
        {s('M24,80 V112 M136,80 V112', 'pa-s-ink')}
        {s('M40,100 l10,10 M50,100 l-10,10 M110,100 l10,10 M120,100 l-10,10', 'pa-s-violet', 3)}
      </>
    ),
  },
  crates: {
    box: SQUARE,
    tint: true,
    draw: () => (
      <>
        {crate(20, 84)}
        {crate(62, 84)}
        {crate(104, 84)}
        {crate(62, 50)}
      </>
    ),
  },
  letters: {
    box: WIDE,
    tint: true,
    draw: () => (
      <>
        {r(-4, 100, 348, 30, 'pa-paper')}
        {r(90, 78, 160, 22, 'pa-crate')}
        {envelope(104, 44, -6)}
        {envelope(150, 40, 4)}
        {envelope(196, 46, -3)}
        {envelope(128, 14, 8)}
        {envelope(176, 8, -5)}
      </>
    ),
  },
  chat: {
    box: SQUARE,
    tint: false,
    draw: () => (
      <>
        {r(50, 10, 60, 112, 'pa-paper', 8)}
        {r(56, 22, 48, 84, 'pa-tint')}
        {r(60, 30, 30, 12, 'pa-fig', 4)}
        {r(70, 50, 30, 12, 'pa-fig', 4)}
        <circle cx="70" cy="88" r="3" className="pa-ink" />
        <circle cx="80" cy="88" r="3" className="pa-ink" />
        <circle cx="90" cy="88" r="3" className="pa-ink" />
      </>
    ),
  },
  note: {
    box: SQUARE,
    tint: true,
    draw: () => (
      <>
        {r(16, 14, 128, 100, 'pa-crate')}
        <g transform="rotate(-4 80 62)">
          {r(48, 34, 64, 56, 'pa-paper')}
          {s('M58,58 H102 M58,68 H96 M58,78 H90', 'pa-s-ink', 2.4)}
        </g>
        <circle cx="80" cy="36" r="5" className="pa-violet pa-l" strokeWidth={2} />
      </>
    ),
  },
  ledger: {
    box: WIDE,
    tint: true,
    draw: () => (
      <>
        {r(110, 8, 120, 108, 'pa-paper')}
        <rect x="110" y="8" width="120" height="18" className="pa-ink" />
        {s('M122,44 H218 M122,58 H218 M122,72 H218 M122,86 H218 M180,30 V100', 'pa-s-ink', 2)}
        <ellipse
          cx="200"
          cy="100"
          rx="24"
          ry="11"
          className="pa-s-violet"
          fill="none"
          strokeWidth={3.4}
        />
      </>
    ),
  },
  coffee: {
    box: SQUARE,
    tint: false,
    draw: () => (
      <>
        {r(46, 18, 68, 92, 'pa-fig')}
        <rect x="46" y="18" width="68" height="18" className="pa-ink" />
        <rect x="74" y="56" width="12" height="10" className="pa-ink" />
        {r(68, 84, 24, 22, 'pa-paper')}
        {s('M56,44 L66,54 L58,62 L70,72', 'pa-s-ink', 3)}
        {s('M120,30 l12,-8 M122,44 l14,0 M120,58 l12,8', 'pa-s-violet', 3)}
      </>
    ),
  },
  glance: {
    box: SQUARE,
    tint: true,
    draw: () => (
      <>
        {r(-4, 104, 168, 30, 'pa-paper')}
        {fig(40, 60)}
        {fig(80, 56)}
        {fig(120, 60)}
      </>
    ),
  },
  board: {
    box: WIDE,
    tint: true,
    draw: () => (
      <>
        {r(60, 8, 220, 100, 'pa-crate')}
        {r(130, 16, 80, 84, 'pa-paper')}
        {s('M140,34 H200 M140,46 H192 M140,58 H198 M140,70 H186 M140,82 H194', 'pa-s-ink', 2.4)}
        <circle cx="170" cy="18" r="5" className="pa-violet pa-l" strokeWidth={2} />
        {r(80, 30, 34, 26, 'pa-paper')}
        {r(230, 40, 34, 30, 'pa-paper')}
      </>
    ),
  },
  backs: {
    box: SQUARE,
    tint: false,
    draw: () => (
      <>
        {r(-4, 104, 168, 30, 'pa-tint')}
        {r(100, 6, 56, 40, 'pa-crate')}
        {fig(36, 60)}
        {fig(72, 64)}
        {fig(108, 60)}
      </>
    ),
  },
  truck: {
    box: WIDE,
    tint: true,
    draw: () => (
      <>
        <circle cx="300" cy="30" r="14" className="pa-cap pa-l" strokeWidth={W} />
        {r(-4, 100, 348, 26, 'pa-paper')}
        {r(56, 40, 150, 56, 'pa-paper')}
        <path d="M206,56 H246 L268,78 V96 H206 Z" className="pa-violet pa-l" strokeWidth={W} />
        {[96, 166, 236].map((x) => (
          <circle key={x} cx={x} cy="98" r="12" className="pa-ink" />
        ))}
        {crate(76, 58, 30, 26)}
        {crate(112, 58, 30, 26)}
      </>
    ),
  },
  dashboard: {
    box: SQUARE,
    tint: false,
    draw: () => (
      <>
        {r(14, 12, 132, 96, 'pa-tint')}
        <rect x="30" y="82" width="16" height="14" className="pa-violet" />
        <rect x="54" y="74" width="16" height="22" className="pa-violet" />
        <rect x="78" y="58" width="16" height="38" className="pa-violet" />
        <rect x="102" y="34" width="16" height="62" className="pa-violet" />
        {s('M24,96 H136', 'pa-s-ink')}
      </>
    ),
  },
  warehouse: {
    box: SQUARE,
    tint: true,
    draw: () => (
      <>
        <path d="M14,52 L80,20 L146,52 V118 H14 Z" className="pa-paper pa-l" strokeWidth={W} />
        {r(52, 66, 56, 52, 'pa-fig')}
        {s('M52,78 H108 M52,90 H108 M52,102 H108', 'pa-s-ink', 2)}
        {crate(20, 94, 26, 24)}
        {crate(114, 94, 26, 24)}
      </>
    ),
  },
  newsroom: {
    box: SQUARE,
    tint: true,
    draw: () => (
      <>
        {r(30, 18, 100, 96, 'pa-paper')}
        <rect x="30" y="18" width="100" height="16" className="pa-ink" />
        <rect x="40" y="42" width="80" height="8" className="pa-ink" />
        {r(40, 58, 36, 30, 'pa-fig')}
        {s('M84,60 H120 M84,70 H120 M84,80 H114 M40,98 H120', 'pa-s-ink', 2)}
      </>
    ),
  },
  clinic: {
    box: SQUARE,
    tint: true,
    draw: () => (
      <>
        <path d="M24,46 L80,22 L136,46 V118 H24 Z" className="pa-paper pa-l" strokeWidth={W} />
        <rect x="68" y="52" width="24" height="8" className="pa-violet" />
        <rect x="76" y="44" width="8" height="24" className="pa-violet" />
        {r(66, 86, 28, 32, 'pa-fig')}
        {r(36, 78, 20, 18, 'pa-tint')}
        {r(104, 78, 20, 18, 'pa-tint')}
      </>
    ),
  },
}

export function PanelArt({ art }: { art: ArtKey }) {
  const id = useSvgId()
  const a = ART[art]
  const [, , w, h] = a.box.split(' ').map(Number)
  return (
    <svg className="panelart" viewBox={a.box} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`${id}c`}>
          <rect width={w} height={h} />
        </clipPath>
        <pattern id={`${id}v`} width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="1.7" className="pa-dot" fillOpacity="0.24" />
        </pattern>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width={w} height={h} className={a.tint ? 'pa-tint' : 'pa-paper'} />
        {a.tint ? <rect width={w} height={h} fill={`url(#${id}v)`} /> : null}
        {a.draw()}
      </g>
    </svg>
  )
}
