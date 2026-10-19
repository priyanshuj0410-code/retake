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
 * whose signed sum over the pairs is at least as far from zero as the player's own. Three zones (thresholds PENDING v18,
 * config.season.rating):
 *   - not enough to say: under minPairs decisive pairs, or no relabelling could reach p 1 - q,
 *     or (the headline only) the player followed the notes in under engagementMin of clear pairs;
 *   - leans towards a group: p at most 1 - q;
 *   - no lean read: otherwise.
 */
import { config } from '../engine/config'
import { seeded } from '../engine/rng'
import type { Domain } from './content'
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
  /** The sex reading on each domain's own cards (thresholds PENDING v18). */
  domains: Record<Domain, CueReading>
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
          if (r.isRating(i)) decisive.push({ beat: i, a: b.chars[x].slot, b: b.chars[y].slot, adv })
        } else if (b.beat.form !== 'B') {
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

/** Who carries a cue and who is in its focal group: the fixed cast for sex, religion and tone;
    the one-off characters for caste (surnames) and birthplace (PENDING v18, config.season.cueCarriers). */
export function cueSets(people: CastMember[], cue: Cue): { real: Set<number>; pool: Set<number> } {
  const carries = (c: CastMember) =>
    cue === 'caste' ? !!c.caste : cue === 'birthplace' ? !!c.born : !c.oneOff
  const focal = (c: CastMember) =>
    cue === 'sex'
      ? c.sex === 'woman'
      : cue === 'religion'
        ? c.religion === 'muslim'
        : cue === 'tone'
          ? c.tone === 'darker'
          : cue === 'caste'
            ? c.caste === 'sc-coded'
            : c.born?.region === 'south'
  const pool = people.filter(carries)
  return {
    real: new Set(pool.filter(focal).map((c) => c.slot)),
    pool: new Set(pool.map((c) => c.slot)),
  }
}

/** The cast cues' relabellings: every 4 of the 8 colleagues as the focal group (70). */
export function labellings(cast: CastMember[], cue: Cue): Set<number>[] {
  const { real } = cueSets(cast, cue)
  return subsets(
    cast.map((c) => c.slot),
    real.size,
  ).map((x) => new Set(x))
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

export function readCue(
  people: CastMember[],
  pairs: Pair[],
  cue: Cue,
  minPairs = config.season.rating.minPairs,
): CueReading {
  const { q, permutations } = config.season.rating
  const alpha = 1 - q
  const { real, pool } = cueSets(people, cue)
  const obs = weightOf(pairs, real, pool)
  /* The test statistic is the signed sum, not the mean: a relabelling that leaves only a few
     pairs differing on the cue could otherwise reach an extreme mean from two or three pairs. */
  let null_: number[]
  if (cue === 'caste' || cue === 'birthplace') {
    /* One-off characters each appear in one pair, so relabelling them is flipping each pair's
       sign: exact up to 2^12 pairs, else `permutations` seeded draws. */
    const signed = pairs
      .filter((p) => pool.has(p.a) && pool.has(p.b) && real.has(p.a) !== real.has(p.b))
      .map((p) => (real.has(p.a) ? p.adv : -p.adv))
    const m = signed.length
    const rng = seeded(4242)
    const flips =
      m <= 12
        ? [...Array(2 ** m).keys()].map((mask) => signed.map((_, i) => ((mask >> i) & 1 ? -1 : 1)))
        : [...Array(permutations).keys()].map(() => signed.map(() => (rng.next() < 0.5 ? -1 : 1)))
    null_ = flips.map((f) => Math.abs(signed.reduce((s, v, i) => s + v * f[i], 0)))
  } else {
    const cast = people.filter((c) => !c.oneOff)
    null_ = labellings(cast, cue).map((l) => Math.abs(weightOf(pairs, l, pool).sum))
  }
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
  const people = [...r.cast, ...r.season.extras]
  const sex = readCue(people, decisive, 'sex')
  const domainOf = (i: number) => {
    const b = r.season.beats[i]
    return b.kind === 'people' ? b.beat.domain : null
  }
  const domains = Object.fromEntries(
    (['hiring', 'conduct', 'resources'] as Domain[]).map((d) => [
      d,
      readCue(
        people,
        decisive.filter((p) => domainOf(p.beat) === d),
        'sex',
        config.season.domains.minPairs,
      ),
    ]),
  ) as Record<Domain, CueReading>
  return {
    headline: {
      ...sex,
      engaged,
      zone: engaged ? sex.zone : 'unread',
      towards: engaged ? sex.towards : undefined,
    },
    others: CUES.slice(1).map((c) => readCue(people, decisive, c)),
    domains: Object.fromEntries(
      Object.entries(domains).map(([d, x]) => [
        d,
        engaged ? x : { ...x, zone: 'unread', towards: undefined },
      ]),
    ) as Record<Domain, CueReading>,
    decisive,
    clear,
  }
}
