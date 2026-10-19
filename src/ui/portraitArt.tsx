/**
 * The portrait system (knowledge/design.md, section 4c): one geometry for every person and one
 * for each of the eight mascot animals, drawn as light inline SVG in the comic style (ink line,
 * halftone shading, one dark brown for all hair, one uniform). Colours come from the art tokens
 * through classes (portrait.css); the skin tone and the animal are picked by data-tone and
 * data-animal on the picture. There is no attire layer: religion is carried by names only.
 */
import type { ReactNode } from 'react'
import { useSvgId } from './svgId'

export type Tone = 'l1' | 'l2' | 'm' | 'd1' | 'd2'
export type Hair = 'long' | 'bun' | 'plait' | 'wavy' | 'side' | 'curly' | 'crew' | 'quiff'
export type Animal =
  'bear' | 'panda' | 'frog' | 'koala' | 'elephant' | 'penguin' | 'rabbit' | 'tiger'

export type Look =
  | {
      kind: 'person'
      sex: 'woman' | 'man'
      /** The character's slot, the key of a generated image (cast 0 to 7, one-offs 100 up). */
      slot?: number
      tone: Tone
      hair: Hair
      facial?: 'beard' | 'moustache'
      glasses?: boolean
    }
  | { kind: 'animal'; animal: Animal }

const LINE = 2.6

/* Shapes. A class names the fill; 'pt-l' adds the ink line. */
const p = (d: string, c: string, line = true) => (
  <path d={d} className={line ? `${c} pt-l` : c} strokeWidth={line ? LINE : undefined} />
)
const ci = (x: number, y: number, r: number, c: string, line = true) => (
  <circle
    cx={x}
    cy={y}
    r={r}
    className={line ? `${c} pt-l` : c}
    strokeWidth={line ? LINE : undefined}
  />
)
const el = (x: number, y: number, rx: number, ry: number, c: string, line = true, rot = 0) => (
  <ellipse
    cx={x}
    cy={y}
    rx={rx}
    ry={ry}
    transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}
    className={line ? `${c} pt-l` : c}
    strokeWidth={line ? LINE : undefined}
  />
)
const ln = (d: string, c: string, w: number) => (
  <path
    d={d}
    className={c}
    fill="none"
    strokeWidth={w}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
)

const G = {
  head: 'M56,102 C56,64 76,54 100,54 C124,54 144,64 144,102 C144,134 126,158 100,158 C74,158 56,134 56,102 Z',
  shade:
    'M122,60 C138,70 144,86 144,102 C144,134 126,158 100,158 C120,148 132,128 132,104 C132,86 128,70 122,60 Z',
  neck: 'M84,138 L84,176 L116,176 L116,138 Z',
  neckSh: 'M84,146 Q100,162 116,146 L116,158 Q100,170 84,158 Z',
  torso: 'M16,222 C18,186 50,170 84,168 L116,168 C150,170 182,186 184,222 Z',
  collar: 'M84,168 L100,190 L116,168 L108,166 L100,178 L92,166 Z',
  browL: 'M73,98 Q82,92 91,97',
  browR: 'M109,97 Q118,92 127,98',
  nose: 'M100,113 Q95,124 99,127 Q102,128 105,126',
  mouth: 'M89,138 Q100,145 111,138',
  mous: 'M85,132 Q100,124 115,132 Q108,138 100,134 Q92,138 85,132 Z',
  beard:
    'M57,112 C60,150 80,163 100,163 C120,163 140,150 143,112 C138,134 125,149 113,147 Q100,141 87,147 C75,149 62,134 57,112 Z',
}

const HAIR: Record<
  Hair,
  { back?: string; front: string; bun?: boolean; plait?: boolean; curls?: boolean }
> = {
  long: {
    back: 'M50,100 C46,56 72,42 100,42 C128,42 154,56 150,100 L154,186 C130,194 70,194 46,186 Z',
    front:
      'M54,104 C50,62 74,44 102,44 C130,44 150,62 146,104 C140,84 126,70 108,66 C96,82 76,92 54,104 Z',
  },
  bun: {
    back: 'M54,100 C54,60 76,46 100,46 C124,46 146,60 146,100 Z',
    bun: true,
    front:
      'M55,102 C54,64 76,48 100,48 C124,48 146,64 145,102 C140,80 124,68 100,70 C76,68 60,80 55,102 Z',
  },
  plait: {
    back: 'M54,100 C54,60 76,46 100,46 C124,46 146,60 146,100 Z',
    plait: true,
    front:
      'M55,102 C54,62 78,46 102,46 C126,46 146,62 145,102 C138,82 124,72 106,72 C90,72 66,82 55,102 Z',
  },
  wavy: {
    back: 'M46,104 C40,56 70,40 100,40 C130,40 160,56 154,104 C162,126 150,150 158,176 C136,186 64,186 42,176 C50,150 38,126 46,104 Z',
    front:
      'M54,104 C50,60 76,44 100,44 C128,44 152,62 146,104 C138,86 128,76 112,72 C110,84 98,92 86,90 C76,90 62,96 54,104 Z',
  },
  side: {
    front:
      'M54,100 C50,58 74,42 102,42 C130,42 150,58 146,98 C142,84 136,76 128,72 C112,78 86,76 70,72 C62,80 58,88 54,100 Z',
  },
  curly: {
    front:
      'M56,98 C55,62 76,50 100,50 C124,50 145,62 144,98 C140,82 124,72 100,72 C76,72 60,82 56,98 Z',
    curls: true,
  },
  crew: {
    front:
      'M56,96 C56,62 76,50 100,50 C124,50 144,62 144,96 C142,82 134,72 120,68 L80,68 C66,72 58,82 56,96 Z',
  },
  quiff: {
    front:
      'M54,98 C50,56 80,36 110,40 C136,44 150,64 146,96 C140,80 128,70 112,66 C96,64 76,70 66,80 C60,86 56,92 54,98 Z',
  },
}

const CURLS = [...Array(9).keys()].map((i) => {
  const a = Math.PI * (1.1 + i * 0.1)
  return [
    Math.round((100 + 47 * Math.cos(a)) * 10) / 10,
    Math.round((96 + 46 * Math.sin(a)) * 10) / 10,
  ]
})

function Person({ look, ink }: { look: Extract<Look, { kind: 'person' }>; ink: string }) {
  const H = HAIR[look.hair]
  return (
    <>
      {H.back ? p(H.back, 'pt-hair') : null}
      {H.bun ? ci(100, 44, 19, 'pt-hair') : null}
      {p(G.torso, 'pt-cloth')}
      {p(G.collar, 'pt-clothd', false)}
      {ln('M86,172 L96,202', 'pt-s-lanyard', 4)}
      {ln('M114,172 L104,202', 'pt-s-lanyard', 4)}
      <rect
        x="90"
        y="198"
        width="20"
        height="16"
        rx="2"
        className="pt-badge pt-l"
        strokeWidth={LINE}
      />
      {p(G.neck, 'pt-skin')}
      {p(G.neckSh, 'pt-skinsh', false)}
      {H.plait
        ? [
            [136, 138],
            [140, 154],
            [144, 170],
            [148, 186],
          ].map(([x, y]) => <g key={y}>{el(x, y, 9, 10, 'pt-hair')}</g>)
        : null}
      {H.plait ? ci(150, 198, 4, 'pt-lanyard') : null}
      {el(56, 108, 8, 12, 'pt-skin')}
      {el(144, 108, 8, 12, 'pt-skin')}
      {p(G.head, 'pt-skin')}
      <path d={G.shade} fill={`url(#${ink})`} />
      {el(82, 110, 3.4, 4.4, 'pt-eye', false)}
      {el(118, 110, 3.4, 4.4, 'pt-eye', false)}
      {ln(G.browL, 'pt-s-hair', 3.6)}
      {ln(G.browR, 'pt-s-hair', 3.6)}
      {ln(G.nose, 'pt-s-feat', 2.4)}
      {look.facial === 'beard' ? p(G.beard, 'pt-hair', false) : null}
      {look.facial ? p(G.mous, 'pt-hair', false) : null}
      {ln(G.mouth, look.facial === 'beard' ? 'pt-s-lip' : 'pt-s-feat', 3)}
      {p(H.front, 'pt-hair')}
      {H.curls ? CURLS.map(([x, y]) => <g key={x}>{ci(x, y, 10.5, 'pt-hair')}</g>) : null}
      {look.glasses ? (
        <>
          <rect
            x="70"
            y="101"
            width="24"
            height="18"
            rx="6"
            className="pt-glass"
            fillOpacity="0.18"
            strokeWidth={LINE}
          />
          <rect
            x="106"
            y="101"
            width="24"
            height="18"
            rx="6"
            className="pt-glass"
            fillOpacity="0.18"
            strokeWidth={LINE}
          />
          {ln('M94,108 Q100,104 106,108', 'pt-s-line', LINE)}
        </>
      ) : null}
    </>
  )
}

const ANIMAL: Record<Animal, () => ReactNode> = {
  bear: () => (
    <>
      {ci(62, 66, 20, 'pt-fur')}
      {ci(138, 66, 20, 'pt-fur')}
      {ci(62, 66, 10, 'pt-fur-b', false)}
      {ci(138, 66, 10, 'pt-fur-b', false)}
      {el(100, 118, 56, 52, 'pt-fur')}
      {el(100, 138, 24, 18, 'pt-light')}
      {el(100, 128, 10, 7, 'pt-dark', false)}
      {ci(80, 108, 5.5, 'pt-dark', false)}
      {ci(120, 108, 5.5, 'pt-dark', false)}
      {ln('M92,146 Q100,152 108,146', 'pt-s-dark', 3)}
    </>
  ),
  panda: () => (
    <>
      {ci(60, 70, 20, 'pt-dark')}
      {ci(140, 70, 20, 'pt-dark')}
      {el(100, 118, 56, 52, 'pt-light')}
      {el(78, 112, 13, 17, 'pt-dark', false, -25)}
      {el(122, 112, 13, 17, 'pt-dark', false, 25)}
      {ci(80, 112, 4, 'pt-white', false)}
      {ci(120, 112, 4, 'pt-white', false)}
      {el(100, 134, 9, 6, 'pt-dark', false)}
      {ln('M92,144 Q100,150 108,144', 'pt-s-dark', 3)}
    </>
  ),
  frog: () => (
    <>
      {ci(68, 84, 22, 'pt-fur')}
      {ci(132, 84, 22, 'pt-fur')}
      {el(100, 126, 62, 44, 'pt-fur')}
      {ci(68, 82, 13, 'pt-white', false)}
      {ci(132, 82, 13, 'pt-white', false)}
      {ci(68, 84, 6.5, 'pt-dark', false)}
      {ci(132, 84, 6.5, 'pt-dark', false)}
      {el(100, 152, 34, 13, 'pt-light', false)}
      {ln('M66,128 Q100,150 134,128', 'pt-s-dark', 3.2)}
      {ci(62, 138, 7, 'pt-acc', false)}
      {ci(138, 138, 7, 'pt-acc', false)}
    </>
  ),
  koala: () => (
    <>
      {ci(54, 86, 30, 'pt-fur')}
      {ci(146, 86, 30, 'pt-fur')}
      {ci(54, 88, 17, 'pt-light', false)}
      {ci(146, 88, 17, 'pt-light', false)}
      {el(100, 120, 50, 48, 'pt-fur')}
      {el(100, 126, 13, 19, 'pt-dark')}
      {ci(80, 110, 5, 'pt-dark', false)}
      {ci(120, 110, 5, 'pt-dark', false)}
      {ln('M92,152 Q100,156 108,152', 'pt-s-dark', 3)}
    </>
  ),
  elephant: () => (
    <>
      {el(48, 112, 34, 44, 'pt-fur-b')}
      {el(152, 112, 34, 44, 'pt-fur-b')}
      {el(48, 112, 20, 28, 'pt-acc', false)}
      {el(152, 112, 20, 28, 'pt-acc', false)}
      {el(100, 104, 46, 46, 'pt-fur')}
      {p(
        'M88,126 C86,160 92,184 108,192 C116,196 122,188 116,182 C106,176 112,152 112,126 Z',
        'pt-fur',
      )}
      {p('M80,134 Q74,148 82,152 Q84,142 86,134 Z', 'pt-light')}
      {p('M120,134 Q126,148 118,152 Q116,142 114,134 Z', 'pt-light')}
      {ci(84, 102, 5, 'pt-dark', false)}
      {ci(116, 102, 5, 'pt-dark', false)}
    </>
  ),
  penguin: () => (
    <>
      {el(100, 120, 58, 62, 'pt-dark')}
      {el(84, 120, 24, 30, 'pt-light', false)}
      {el(116, 120, 24, 30, 'pt-light', false)}
      {ci(86, 114, 5, 'pt-dark', false)}
      {ci(114, 114, 5, 'pt-dark', false)}
      {p('M90,132 L110,132 L100,146 Z', 'pt-acc')}
      {ci(74, 134, 5, 'pt-acc-b', false)}
      {ci(126, 134, 5, 'pt-acc-b', false)}
    </>
  ),
  rabbit: () => (
    <>
      {el(76, 52, 14, 42, 'pt-fur')}
      {el(124, 52, 14, 42, 'pt-fur')}
      {el(76, 58, 7, 28, 'pt-acc', false)}
      {el(124, 58, 7, 28, 'pt-acc', false)}
      {el(100, 128, 48, 44, 'pt-fur')}
      {el(100, 142, 20, 13, 'pt-light', false)}
      {p('M95,134 L105,134 L100,140 Z', 'pt-acc-b', false)}
      {ci(82, 120, 5, 'pt-dark', false)}
      {ci(118, 120, 5, 'pt-dark', false)}
      {ln('M100,140 L100,148 M92,150 Q100,154 108,150', 'pt-s-dark', 2.6)}
      {ln('M60,140 L80,142 M60,148 L80,146 M140,140 L120,142 M140,148 L120,146', 'pt-s-dark', 1.6)}
    </>
  ),
  tiger: () => (
    <>
      {ci(62, 72, 18, 'pt-fur')}
      {ci(138, 72, 18, 'pt-fur')}
      {ci(62, 72, 9, 'pt-light', false)}
      {ci(138, 72, 9, 'pt-light', false)}
      {el(100, 118, 56, 50, 'pt-fur')}
      {el(88, 138, 18, 14, 'pt-light', false)}
      {el(112, 138, 18, 14, 'pt-light', false)}
      {p('M100,70 L95,88 L105,88 Z', 'pt-dark', false)}
      {p('M46,108 L68,114 L46,121 Z', 'pt-dark', false)}
      {p('M154,108 L132,114 L154,121 Z', 'pt-dark', false)}
      {p('M50,130 L66,132 L52,138 Z', 'pt-dark', false)}
      {p('M150,130 L134,132 L148,138 Z', 'pt-dark', false)}
      {ci(82, 110, 5.5, 'pt-dark', false)}
      {ci(118, 110, 5.5, 'pt-dark', false)}
      {p('M93,128 L107,128 L100,135 Z', 'pt-acc', false)}
    </>
  ),
}

/**
 * One drawn picture: the tinted panel with its halftone corner, then the person or the animal.
 * With `backdrop`, only the panel and its halftone, for a generated image to sit on.
 */
export function PortraitArt({ look, backdrop }: { look: Look; backdrop?: boolean }) {
  const id = useSvgId()
  return (
    <svg
      className="portrait__art"
      viewBox="0 0 200 220"
      aria-hidden="true"
      focusable="false"
      data-tone={look.kind === 'person' ? look.tone : undefined}
      data-animal={look.kind === 'animal' ? look.animal : undefined}
    >
      <defs>
        <clipPath id={`${id}c`}>
          <rect width="200" height="220" />
        </clipPath>
        <pattern id={`${id}i`} width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="1.25" className="pt-dot-ink" fillOpacity="0.38" />
        </pattern>
        <pattern id={`${id}v`} width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="1.7" className="pt-dot-violet" fillOpacity="0.24" />
        </pattern>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width="200" height="220" className="pt-bg" />
        <circle cx="168" cy="36" r="96" fill={`url(#${id}v)`} />
        {backdrop ? null : look.kind === 'person' ? (
          <Person look={look} ink={`${id}i`} />
        ) : (
          ANIMAL[look.animal]()
        )}
      </g>
    </svg>
  )
}
