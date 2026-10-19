/**
 * The result page's words, built from the player's own decisions (the owner's NPQE structure
 * with our evidence and stance, 19 Oct 2026): the headline band, bar and reasons; the readings
 * grid (one card per cue, sex first); then one section per decision area with where the
 * decisions followed the record, the blind spots (each ending with the actual decisive pairs),
 * reflection prompts and habits. Every sentence is a template from content/story.json filled
 * with counts and names; nothing here writes a judgement, and a card appears only where the
 * decisions support it, so the page can land anywhere.
 */
import type { Lang, T } from '../content/types'
import { config } from '../engine/config'
import { fill } from '../engine/text'
import { RT, SS, type Domain } from './content'
import {
  advantage,
  CUES,
  cueSets,
  rate,
  type Cue,
  type CueReading,
  type Pair,
  type Rating,
} from './rating'
import type { StoryRunner } from './runner'
import { peopleBeats } from './runner'

export interface Point {
  title: string
  body: string
  evidence: string[]
}

export interface CueCard {
  cue: Cue
  label: string
  level: string
  zone: 'lean' | 'none' | 'unread'
  meaning: string
}

export interface DomainSection {
  domain: Domain
  title: string
  narrative: string
  /** The sex reading on this domain's own cards, as a level and a zone. */
  reading: { level: string; zone: 'lean' | 'none' | 'unread'; group: string }
  followed: Point[]
  blind: Point[]
  origin: string[]
  watch: string[]
}

export interface ResultModel {
  rating: Rating
  band: string
  body: string
  /** Where the player sits on the bar, 0 (always the men) to 1 (always the women), and the shaded middle. */
  bar: { at: number; from: number; to: number; left: string; right: string; label: string } | null
  strength: string | null
  /** The one number to remember: k of n equal woman-and-man pairs went one way, and the dots. */
  hero: {
    big: string
    line: string
    dots: { filled: number; rings: number; dashed: number; label: string }
  } | null
  why: string[]
  cards: CueCard[]
  domains: DomainSection[]
  share: string
}

const pct = (x: number) => Math.round(x * 100)
const DOMAINS: Domain[] = ['hiring', 'conduct', 'resources']

export function cueGroup(r: Pick<CueReading, 'cue' | 'towards'>, lang: Lang): string {
  const c = RT.cues[r.cue]
  return (r.towards === 'focal' ? c.focal : c.comparison)[lang]
}

export function resultModel(run: StoryRunner): ResultModel {
  const lang = run.lang
  const L = (t: T) => t[lang]
  const rating = rate(run)
  const h = rating.headline
  const sexWords = RT.cues.sex
  const bandKey = !h.engaged
    ? 'unengaged'
    : h.zone === 'lean'
      ? 'lean'
      : h.zone === 'none'
        ? 'none'
        : 'unread'
  const group = h.zone === 'lean' ? cueGroup(h, lang) : ''
  const band = fill(L(RT.bands[bandKey].name), { group })
  const body = fill(L(RT.bands[bandKey].body), { group })

  /* The mixed-sex decisive pairs, counted by who came out ahead. */
  const sexPairs = rating.decisive.filter((p) => run.person(p.a).sex !== run.person(p.b).sex)
  const womanAhead = sexPairs.filter(
    (p) =>
      (run.person(p.a).sex === 'woman' && p.adv > 0) ||
      (run.person(p.b).sex === 'woman' && p.adv < 0),
  ).length
  const manAhead = sexPairs.filter((p) => p.adv !== 0).length - womanAhead
  const n = sexPairs.length

  let bar: ResultModel['bar'] = null
  let strength: string | null = null
  let hero: ResultModel['hero'] = null
  if (n > 0 && bandKey !== 'unengaged') {
    const lead = manAhead >= womanAhead
    const even = n - manAhead - womanAhead
    hero = {
      big: fill(L(RT.heroNumber), { k: lead ? manAhead : womanAhead, n }),
      line: fill(L(RT.heroLine), {
        one: L(lead ? sexWords.comparisonOne : sexWords.focalOne),
      }),
      dots: {
        filled: manAhead,
        rings: womanAhead,
        dashed: even,
        label: fill(L(RT.heroDots), { n, m: manAhead, w: womanAhead, e: even }),
      },
    }
    const at = (1 + h.weight) / 2
    bar = {
      at,
      from: (1 - h.floor) / 2,
      to: (1 + h.floor) / 2,
      left: L(sexWords.comparison),
      right: L(sexWords.focal),
      label: L(RT.strengthLabel),
    }
    const menLead = manAhead >= womanAhead
    strength = fill(L(RT.strengthText), {
      n,
      a: L(menLead ? sexWords.comparison : sexWords.focal),
      k: menLead ? manAhead : womanAhead,
      pct: pct((menLead ? manAhead : womanAhead) / n),
    })
  }

  const why: string[] = []
  if (n > 0 && manAhead !== womanAhead)
    why.push(
      fill(L(RT.whyAll), {
        winner: L(manAhead > womanAhead ? sexWords.comparisonOne : sexWords.focalOne),
        k: Math.max(manAhead, womanAhead),
        n,
      }),
    )
  /* Rival pairs that met most often with the same record. */
  const byPair = new Map<
    string,
    { w: number; m: number; wAhead: number; mAhead: number; n: number }
  >()
  for (const p of sexPairs) {
    const [w, m] = run.person(p.a).sex === 'woman' ? [p.a, p.b] : [p.b, p.a]
    const key = `${w}-${m}`
    const e = byPair.get(key) ?? { w, m, wAhead: 0, mAhead: 0, n: 0 }
    e.n += 1
    const wonByA = p.adv > 0
    if (p.adv !== 0) {
      if ((wonByA && p.a === w) || (!wonByA && p.b === w)) e.wAhead += 1
      else e.mAhead += 1
    }
    byPair.set(key, e)
  }
  const name = (slot: number) => run.displayName(slot, true)
  for (const e of [...byPair.values()]
    .filter((x) => x.n >= 2)
    .sort((x, y) => y.n - x.n)
    .slice(0, 2)) {
    if (e.wAhead === e.mAhead)
      why.push(fill(L(RT.whyPairEven), { a: name(e.w), b: name(e.m), k: e.wAhead, n: e.n }))
    else {
      const favW = e.wAhead > e.mAhead
      why.push(
        fill(L(RT.whyPair), {
          a: name(e.w),
          b: name(e.m),
          fav: name(favW ? e.w : e.m),
          k: favW ? e.wAhead : e.mAhead,
          n: e.n,
        }),
      )
    }
  }
  /* The readings grid: one card per cue, sex first. */
  const cards: CueCard[] = [h, ...rating.others].map((r) => {
    const g = r.zone === 'lean' ? cueGroup(r, lang) : ''
    return {
      cue: r.cue,
      label: L(RT.cueShort[r.cue]),
      level: r.cue === 'sex' ? band : fill(L(RT.zone[r.zone]), { group: g }),
      zone: r.cue === 'sex' && !h.engaged ? 'unread' : r.zone,
      meaning: fill(L(RT.meaning[r.cue === 'sex' && !h.engaged ? 'unread' : r.zone]), {
        group: g,
      }),
    }
  })

  /* One section per decision area. Card thresholds PENDING v18 (config.season.cards). */
  const { minPairs, share } = config.season.cards
  const winner = (p: Pair) => (p.adv > 0 ? p.a : p.b)
  const episode = (i: number) => fill(L(SS.episodeShort), { n: run.season.beats[i].beat.episode })
  const role = (i: number) => {
    const b = run.season.beats[i]
    return b.kind === 'people' ? L(b.beat.role) : ''
  }
  const domainOf = (i: number) => {
    const b = run.season.beats[i]
    return b.kind === 'people' ? b.beat.domain : null
  }
  const people = [...run.cast, ...run.season.extras]
  const labelsOf = Object.fromEntries(CUES.map((c) => [c, cueSets(people, c)])) as Record<
    Cue,
    ReturnType<typeof cueSets>
  >
  const domains: DomainSection[] = DOMAINS.map((d) => {
    const copy = RT.domains[d]
    const beats = peopleBeats(run).filter(({ i }) => run.isRating(i) && domainOf(i) === d)
    const pairs = rating.decisive.filter((p) => domainOf(p.beat) === d)
    const followed: Point[] = []
    const blind: Point[] = []
    let clearN = 0
    let clearK = 0
    const weak: string[] = []
    for (const { b, i } of beats) {
      const a = run.answers.get(i)
      if (!a) continue
      for (let x = 0; x < b.chars.length; x++)
        for (let y = 0; y < b.chars.length; y++) {
          if (b.chars[x].tier <= b.chars[y].tier) continue
          clearN += 1
          const adv = advantage(b.beat.kind, b.beat.family === 'npt', x, y, a)
          if (adv > 0) clearK += 1
          else if (adv < 0)
            weak.push(
              fill(L(RT.cards.weak), {
                episode: episode(i),
                role: role(i),
                weak: name(b.chars[y].slot),
                strong: name(b.chars[x].slot),
              }),
            )
        }
    }
    if (clearN > 0 && clearK / clearN >= config.season.rating.engagementMin)
      followed.push({
        title: L(RT.cards.clearTitle),
        body: fill(L(RT.cards.clearBody), { k: clearK, n: clearN }),
        evidence: [],
      })
    if (weak.length >= 2)
      blind.push({
        title: L(RT.cards.weakTitle),
        body: fill(L(RT.cards.weakBody), { k: weak.length }),
        evidence: weak.slice(0, 3),
      })
    for (const cue of CUES) {
      const { real: focal, pool } = labelsOf[cue]
      const decided = pairs.filter(
        (p) => pool.has(p.a) && pool.has(p.b) && focal.has(p.a) !== focal.has(p.b) && p.adv !== 0,
      )
      if (decided.length < minPairs) continue
      const fAhead = decided.filter((p) => focal.has(winner(p))).length
      const cAhead = decided.length - fAhead
      const words = RT.cues[cue]
      if (Math.max(fAhead, cAhead) / decided.length >= share) {
        const towards = fAhead > cAhead ? 'focal' : 'comparison'
        const g = cueGroup({ cue, towards }, lang)
        blind.push({
          title: fill(L(RT.cards.cueTitle), { group: g }),
          body: fill(L(RT.cards.cueBody), {
            group: g,
            k: Math.max(fAhead, cAhead),
            n: decided.length,
          }),
          evidence: decided
            .filter((p) => focal.has(winner(p)) === (towards === 'focal'))
            .slice(0, 3)
            .map((p) =>
              fill(L(RT.cards.tied), {
                episode: episode(p.beat),
                role: role(p.beat),
                a: name(p.a),
                b: name(p.b),
                fav: name(winner(p)),
              }),
            ),
        })
      } else if (Math.abs(fAhead - cAhead) <= 1)
        followed.push({
          title: fill(L(RT.cards.evenTitle), { label: L(RT.cueShort[cue]) }),
          body: fill(L(RT.cards.evenBody), {
            a: L(words.focal),
            x: fAhead,
            b: L(words.comparison),
            y: cAhead,
          }),
          evidence: [],
        })
    }
    return {
      domain: d,
      title: L(copy.title),
      narrative: fill(L(copy.narrative), { n: beats.length, k: pairs.length }),
      reading: (() => {
        const dr = rating.domains[d]
        const g = dr.zone === 'lean' ? cueGroup(dr, lang) : ''
        return {
          level: fill(L(RT.domainReading), { zone: fill(L(RT.zone[dr.zone]), { group: g }) }),
          zone: dr.zone,
          group: g,
        }
      })(),
      followed: followed.slice(0, 4),
      blind: blind.slice(0, 4),
      origin: copy.origin.map(L),
      watch: copy.watch.map(L),
    }
  })

  const shareText = fill(L(RT.shareCard), {
    title: L(run.season.story.title),
    decisions: run.decisions,
    episodes: run.season.story.episodes?.length ?? 0,
    cast: run.cast.length,
    band,
  })
  return { rating, band, body, bar, strength, hero, why, cards, domains, share: shareText }
}

/** One saved season as the profile's timeline shows it: its band, worded as on the result page. */
export function bandOf(
  s: { zone: string; towards?: 'focal' | 'comparison' },
  lang: Lang = 'en',
): string {
  const L = (t: T) => t[lang]
  if (s.zone === 'unread') return L(RT.bands.unread.name)
  if (s.zone === 'none') return L(RT.bands.none.name)
  return fill(L(RT.bands.lean.name), { group: cueGroup({ cue: 'sex', towards: s.towards }, lang) })
}
