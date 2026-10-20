/**
 * `pnpm fonts`: copies the trainer's typefaces from the Fontsource packages into public/fonts,
 * so the app self-hosts them and contacts no third party. Hind is the reading face (Latin and
 * Devanagari); its siblings carry the other scripts the Station boards use; Sarpanch is the
 * Lugdi display face. All are under the SIL Open Font Licence.
 */
import { copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const OUT = join(ROOT, 'public/fonts')
const want: [pkg: string, family: string, subsets: string[], weights: number[]][] = [
  ['hind', 'hind', ['latin', 'devanagari'], [400, 500, 600, 700]],
  ['hind-vadodara', 'hind-vadodara', ['gujarati'], [500, 700]],
  ['hind-siliguri', 'hind-siliguri', ['bengali'], [500, 700]],
  ['hind-madurai', 'hind-madurai', ['tamil'], [500, 700]],
  ['hind-guntur', 'hind-guntur', ['telugu'], [500, 700]],
  ['sarpanch', 'sarpanch', ['latin', 'devanagari'], [700, 900]],
]
mkdirSync(OUT, { recursive: true })
for (const [pkg, family, subsets, weights] of want)
  for (const s of subsets)
    for (const w of weights) {
      const f = `${family}-${s}-${w}-normal.woff2`
      copyFileSync(join(ROOT, 'node_modules/@fontsource', pkg, 'files', f), join(OUT, f))
    }
console.log(`fonts copied to ${OUT}`)
