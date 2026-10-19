/**
 * The attitude rating on the result page, read from one season's decisions only.
 *
 * A decisive pair is two colleagues on the same decision, after the reveal, whose notes for
 * the job were equally strong (the same merit tier). In it one colleague came out ahead (put
 * higher, picked, or given the larger share, or for unwanted work the smaller share), or
 * neither did (an equal share). For a cue, the weight is the mean over the decisive pairs whose
 * two colleagues differ on the cue of +1 when the focal group's colleague came out ahead, -1
 * when the comparison group's did, and 0 for neither: from -1 (always the comparison group) to
 * +1 (always the focal group).
 *
 * The noise floor is per person and exact: the same weight under every balanced relabelling
 * of the cast on that cue (sex, religion and tone: every 4 of the 8; caste and birthplace: every
 * 1 of 2 within each sex, which can never reach a reading with eight colleagues), so a liking for one
 * colleague cannot pass as a lean (religion and tone relabel over the whole cast: within sex
 * there are too few relabellings for any reading). The cue's p is the share of relabellings
 * whose signed sum over the pairs is at least as far from zero as the player's own. Three zones (thresholds PENDING v17,
 * config.season.rating):
 *   - not enough to say: under minPairs decisive pairs, or no relabelling could reach p 1 - q,
 *     or (the headline only) the player followed the notes in under engagementMin of clear pairs;
 *   - leans towards a group: p at most 1 - q;
 *   - no lean read: otherwise.
 */
import { config } from '../engine/config'
import type { CastMember } from './session'
import type { BeatAnswer, StoryRunner } from './runner'
import { peopleBeats } from './runner'

export type Cue = 'sex' | 'religion' | 'tone' | 'caste' | 'birthplace'
export const CUES: Cue[] = ['sex', 'religion', 'tone', 'caste', 'birthplace']
export type Zone = 'lean' | 'none' | 'unread'

export interface Pair {
  beat: number
  a: number
  b: number
  /** +1 when a came out ahead of b, -1 when b did, 0 for neither. */
  adv: number
}

export interface CueReading {
  cue: Cue
  zone: Zone
  /** Which group the lean is towards, when zone is lean. */
  towards?: 'focal' | 'comparison'
  weight: number
  pairs: number
  p: number
  /** The weight a lean has to pass (either side of zero): the shaded middle of the strength bar. */
  floor: number
  labellings: number
}

export interface Rating {
  headline: CueReading & { engaged: boolean }
  others: CueReading[]
  decisive: Pair[]
  /** Pairs with clearly different notes, and how many the player decided the notes' way. */
  clear: { followed: number; n: number }
}

/** a's advantage over b in one answer: +1, -1 or 0. */
export function advantage(
  kind: 'rank' | 'pick' | 'split',
  npt: boolean,
  a: number,
  b: number,
  ans: BeatAnswer,
): number {
  if ('order' in ans) return ans.order.indexOf(a) < ans.order.indexOf(b) ? 1 : -1
  if ('pick' in ans) return ans.pick === a ? 1 : ans.pick === b ? -1 : 0
  if ('units' in ans) {
    const d = Math.sign(ans.units[a] - ans.units[b])
    return npt ? -d : d
  }
  void kind
  return 0
}

export function pairsOf(r: StoryRunner) {
  const decisive: Pair[] = []
  let followed = 0
  let n = 0
  for (const { b, i } of peopleBeats(r)) {
    const ans = r.answers.get(i)
    if (!ans) continue
    const npt = b.beat.family === 'npt'
    for (let x = 0; x < b.chars.length; x++)
      for (let y = x + 1; y < b.chars.length; y++) {
        const adv = advantage(b.beat.kind, npt, x, y, ans)
        const tx = b.chars[x].tier
        const ty = b.chars[y].tier
        if (tx === ty) {
          if (r.revealed(i)) decisive.push({ beat: i, a: b.chars[x].slot, b: b.chars[y].slot, adv })
        } else {
          n += 1
          if (Math.sign(tx - ty) === adv) followed += 1
        }
      }
  }
  return { decisive, clear: { followed, n } }
}

/** Every k-subset of xs. */
function subsets<X>(xs: X[], k: number): X[][] {
  if (k === 0) return [[]]
  if (xs.length < k) return []
  const [h, ...t] = xs
  return [...subsets(t, k - 1).map((s) => [h, ...s]), ...subsets(t, k)]
}

const product = (parts: number[][][]): number[][] =>
  parts.reduce<number[][]>((acc, opts) => acc.flatMap((a) => opts.map((o) => [...a, ...o])), [[]])

/** The cue's real labelling (the focal slots) and every balanced relabelling. */
export function labellings(
  cast: CastMember[],
  cue: Cue,
): { real: Set<number>; all: Set<number>[]; pool: Set<number> } {
  const slots = (f: (c: CastMember) => boolean) => cast.filter(f).map((c) => c.slot)
  const sexes = ['woman', 'man'] as const
  let real: number[]
  let all: number[][]
  /* Who carries the cue at all: everyone for sex, religion and tone; the Hindus (surnames) for
     caste; the Muslims (birthplaces) for birthplace. Only pairs inside it are compared. */
  let pool = cast.map((c) => c.slot)
  if (cue === 'sex') {
    real = slots((c) => c.sex === 'woman')
    all = subsets(
      cast.map((c) => c.slot),
      real.length,
    )
  } else {
    const within = (inPool: (c: CastMember) => boolean, focal: (c: CastMember) => boolean) => {
      pool = slots(inPool)
      const pool_ = inPool
      real = slots((c) => pool_(c) && focal(c))
      all = product(
        sexes.map((s) => {
          const inSex = slots((c) => c.sex === s && pool_(c))
          return subsets(inSex, slots((c) => c.sex === s && pool_(c) && focal(c)).length)
        }),
      )
    }
    /* Religion and tone relabel over the whole cast (every 4 of 8): within each sex there are
       only 36 relabellings, too few for any reading to reach p 0.05. */
    const across = (focal: (c: CastMember) => boolean) => {
      real = slots(focal)
      all = subsets(
        cast.map((c) => c.slot),
        real.length,
      )
    }
    if (cue === 'religion') across((c) => c.religion === 'muslim')
    else if (cue === 'tone') across((c) => c.tone === 'darker')
    else if (cue === 'caste')
      within(
        (c) => !!c.caste,
        (c) => c.caste === 'sc-coded',
      )
    else
      within(
        (c) => !!c.born,
        (c) => c.born?.region === 'south',
      )
  }
  return { real: new Set(real!), all: all!.map((x) => new Set(x)), pool: new Set(pool) }
}

/** The cue's weight over the pairs inside the pool whose two colleagues differ on it. */
export function weightOf(pairs: Pair[], focal: Set<number>, pool?: Set<number>) {
  let sum = 0
  let n = 0
  for (const p of pairs) {
    if (pool && !(pool.has(p.a) && pool.has(p.b))) continue
    const fa = focal.has(p.a)
    if (fa === focal.has(p.b)) continue
    n += 1
    sum += fa ? p.adv : -p.adv
  }
  return { w: n ? sum / n : 0, n, sum }
}

export function readCue(cast: CastMember[], pairs: Pair[], cue: Cue): CueReading {
  const { q, minPairs } = config.season.rating
  const alpha = 1 - q
  const { real, all, pool } = labellings(cast, cue)
  const obs = weightOf(pairs, real, pool)
  /* The test statistic is the signed sum, not the mean: a relabelling that leaves only a few
     pairs differing on the cue could otherwise reach an extreme mean from two or three pairs. */
  const null_ = all.map((l) => Math.abs(weightOf(pairs, l, pool).sum))
  const N = null_.length
  const eps = 1e-9
  const p = null_.filter((x) => x >= Math.abs(obs.sum) - eps).length / N
  /* The floor, on the bar's scale: the largest sum that more than alpha * N relabellings reach, over the player's own pairs. */
  const sorted = null_.slice().sort((x, y) => y - x)
  const k = Math.floor(alpha * N)
  const floor = obs.n ? Math.min(1, (sorted[Math.min(k, N - 1)] ?? 0) / obs.n) : 1
  const reachable = 2 / N <= alpha + eps
  let zone: Zone = 'none'
  if (obs.n < minPairs || !reachable) zone = 'unread'
  else if (p <= alpha + eps && obs.sum !== 0) zone = 'lean'
  const reading: CueReading = { cue, zone, weight: obs.w, pairs: obs.n, p, floor, labellings: N }
  if (zone === 'lean') reading.towards = obs.w > 0 ? 'focal' : 'comparison'
  return reading
}

export function rate(r: StoryRunner): Rating {
  const { decisive, clear } = pairsOf(r)
  const engaged = clear.n === 0 || clear.followed / clear.n >= config.season.rating.engagementMin
  const sex = readCue(r.cast, decisive, 'sex')
  return {
    headline: {
      ...sex,
      engaged,
      zone: engaged ? sex.zone : 'unread',
      towards: engaged ? sex.towards : undefined,
    },
    others: CUES.slice(1).map((c) => readCue(r.cast, decisive, c)),
    decisive,
    clear,
  }
}
