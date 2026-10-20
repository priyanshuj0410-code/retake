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
import { pc, positionOf } from './range'
import {
  advantage,
  cueSets,
  CUES,
  LEANING,
  type Level,
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
  /** The sex reading on this domain's own cards; null unless the headline is at least possible (O2). */
  reading: { level: string; zone: 'lean' | 'none' | 'unread'; group: string } | null
  /** Equal-notes decisions shown as examples, with no lean label, for cues whose headline is under possible. */
  examples: string[]
  followed: Point[]
  blind: Point[]
  origin: string[]
  watch: string[]
}

export interface ResultModel {
  rating: Rating
  band: string
  body: string
  /** Where the result sits on the men-first to women-first line, with its range (EVAL-10). */
  range: {
    at: number
    lo: number
    hi: number
    label: string
    caption: string
    note: string
    ends: { left: string; middle: string; right: string }
  } | null
  /** "Not enough to tell": nothing of the result shows below the tag (EVAL-10, copy audit G5). */
  unread: boolean
  /** The women-and-men pairs: woman first, man first, even (the profile keeps them, EVAL-10). */
  counts: { w: number; m: number; e: number }
  /** The one number to remember: k of n equal woman-and-man pairs went one way, and the dots. */
  hero: {
    big: string
    line: string
    pair: string
    dots: { filled: number; rings: number; dashed: number; label: string }
  } | null
  why: string[]
  cards: CueCard[]
  domains: DomainSection[]
  share: string
  /** What "Include my result" adds to the card: the women-and-men tag and its chance line, nothing else. */
  shareResult: string
}

const DOMAINS: Domain[] = ['hiring', 'conduct', 'resources']
/** The cues a player is shown (owner decision O3): caste and birthplace are read for groups only. */
const SHOWN: Cue[] = ['sex', 'religion', 'tone']

/** The group words a tag uses: "men", "women", or both together ("women and men"). */
export function tagGroup(cue: Cue, towards: 'focal' | 'comparison' | 'both', lang: Lang): string {
  const c = RT.cues[cue]
  const t = towards === 'both' ? c.both : towards === 'focal' ? c.firstFocal : c.firstComparison
  return (t ?? c.label)[lang]
}

/**
 * A reading's tag (EVAL-10, owner): "Clear pattern: men first", "Pattern: men first more
 * often", "Maybe a pattern: men first a little more often", "No pattern: women and men first
 * about equally", "Not enough to tell". The thresholds behind them stay in config
 * (season.rating.levels), never in player copy.
 */
export function levelName(
  level: Level,
  cue: Cue,
  towards: 'focal' | 'comparison' | undefined,
  lang: Lang,
  unengaged = false,
): string {
  const L = (t: T) => t[lang]
  if (unengaged || level === 'unread') return L(RT.tags.unread)
  if (level === 'none') return fill(L(RT.tags.none), { group: tagGroup(cue, 'both', lang) })
  return fill(L(RT.tags[level]), { group: tagGroup(cue, towards ?? 'comparison', lang) })
}

export function cueGroup(r: Pick<CueReading, 'cue' | 'towards'>, lang: Lang): string {
  const c = RT.cues[r.cue]
  return (r.towards === 'focal' ? c.focal : c.comparison)[lang]
}

/** "about 1 in 20", from a rate (EVAL-10's share card): one in N up to a half, else k in 20. */
export function oneIn(rate: number, lang: Lang): { n: number; k: number; of: number } {
  void lang
  if (rate <= 0.5) return { n: Math.max(1, Math.round(1 / rate)), k: 1, of: 0 }
  return { n: 0, k: Math.round(rate * 20), of: 20 }
}

export function resultModel(run: StoryRunner): ResultModel {
  const lang = run.lang
  const L = (t: T) => t[lang]
  const rating = rate(run)
  const h = rating.headline
  const sexWords = RT.cues.sex
  const bandKey = !h.engaged ? 'unengaged' : h.level
  const unread = bandKey === 'unengaged' || bandKey === 'unread'
  const band = levelName(h.level, 'sex', h.towards, lang, !h.engaged)
  const body = fill(L(RT.tagBodies[bandKey]), {
    group: cueGroup({ cue: 'sex', towards: h.towards ?? 'comparison' }, lang),
    both: tagGroup('sex', 'both', lang),
  })

  /* The mixed-sex decisive pairs, counted by who came first. */
  const sexPairs = rating.decisive.filter((p) => run.person(p.a).sex !== run.person(p.b).sex)
  const womanAhead = sexPairs.filter(
    (p) =>
      (run.person(p.a).sex === 'woman' && p.adv > 0) ||
      (run.person(p.b).sex === 'woman' && p.adv < 0),
  ).length
  const manAhead = sexPairs.filter((p) => p.adv !== 0).length - womanAhead
  const n = sexPairs.length
  const even = n - manAhead - womanAhead

  let range: ResultModel['range'] = null
  let hero: ResultModel['hero'] = null
  const pos = positionOf({ w: womanAhead, m: manAhead, e: even })
  if (n > 0 && !unread && pos) {
    const lead = manAhead >= womanAhead
    hero = {
      big: fill(L(RT.heroNumber), { k: lead ? manAhead : womanAhead, n }),
      line: fill(L(RT.heroLine), {
        one: L(lead ? sexWords.comparisonOne : sexWords.focalOne),
      }),
      pair: L(RT.pairIs),
      dots: {
        filled: manAhead,
        rings: womanAhead,
        dashed: even,
        label: fill(L(RT.heroDots), { n, m: manAhead, w: womanAhead, e: even }),
      },
    }
    const ends = { left: L(RT.rangeLeft), middle: L(RT.rangeMiddle), right: L(RT.rangeRight) }
    range = {
      ...pos,
      ends,
      caption: L(RT.rangeCaption),
      note: L(RT.rangeNote),
      label: fill(L(RT.rangeSaid), { at: pc(pos.at), lo: pc(pos.lo), hi: pc(pos.hi), tag: band }),
    }
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
  const cards: CueCard[] = [h, ...rating.others.filter((r) => SHOWN.includes(r.cue))].map((r) => {
    const g = r.towards ? cueGroup(r, lang) : ''
    return {
      cue: r.cue,
      label: L(RT.cueShort[r.cue]),
      level: r.cue === 'sex' ? band : levelName(r.level, r.cue, r.towards, lang),
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
    const examples: string[] = []
    for (const cue of SHOWN) {
      const { real: focal, pool } = labelsOf[cue]
      const decided = pairs.filter(
        (p) => pool.has(p.a) && pool.has(p.b) && focal.has(p.a) !== focal.has(p.b) && p.adv !== 0,
      )
      /* Owner decision O2: an area names a lean on a cue only when that cue's headline is at
         least possible; otherwise its decisions are shown as examples, with no lean label. */
      const overall = cue === 'sex' ? h : rating.others.find((r) => r.cue === cue)
      if (!overall || !LEANING.includes(overall.level)) {
        if (cue === 'sex')
          examples.push(
            ...decided.slice(0, 3).map((p) =>
              fill(L(RT.cards.tied), {
                episode: episode(p.beat),
                role: role(p.beat),
                a: name(p.a),
                b: name(p.b),
                fav: name(winner(p)),
              }),
            ),
          )
        continue
      }
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
      reading: LEANING.includes(h.level)
        ? (() => {
            const dr = rating.domains[d]
            const g = dr.towards ? cueGroup(dr, lang) : ''
            return {
              level: fill(L(RT.domainReading), {
                zone: levelName(dr.level, 'sex', dr.towards, lang),
              }),
              zone: dr.zone,
              group: g,
            }
          })()
        : null,
      examples,
      followed: followed.slice(0, 4),
      blind: blind.slice(0, 4),
      origin: copy.origin.map(L),
      watch: copy.watch.map(L),
    }
  })

  /* The share card (EVAL-10, owner): the season only by default; "Include my result" adds the
     women-and-men tag and one line on how often chance alone gives it, from the reading levels
     in config. Religion and skin tone are never on the card. */
  const shareText = fill(L(RT.shareCard), {
    title: L(run.season.story.title),
    decisions: run.decisions,
    chapters: run.chapters,
    cast: run.cast.length,
  })
  const shareResult = [fill(L(RT.shareResult), { tag: band }), chanceLine(bandKey, lang)]
    .filter(Boolean)
    .join(' ')
  return {
    rating,
    band,
    body,
    range,
    unread,
    counts: { w: womanAhead, m: manAhead, e: even },
    hero,
    why: unread ? [] : why,
    cards,
    domains,
    share: shareText,
    shareResult,
  }
}

/**
 * The share card's chance line, from config.season.rating.levels (never a number in the
 * content): for a pattern tag, how many players who go by the descriptions alone get that tag
 * or a clearer one; for "No pattern", how many of them get it. None for "Not enough to tell".
 */
export function chanceLine(key: Level | 'unengaged', lang: Lang): string {
  const L = (t: T) => t[lang]
  const lv = config.season.rating.levels
  if (key === 'strong' || key === 'moderate' || key === 'possible') {
    const o = oneIn(1 - lv[key], lang)
    return o.of
      ? fill(L(RT.shareChanceMany), { k: o.k, of: o.of })
      : fill(L(RT.shareChancePattern), { n: o.n })
  }
  if (key === 'none') {
    const o = oneIn(lv.possible, lang)
    return o.of
      ? fill(L(RT.shareChanceNone), { k: o.k, of: o.of })
      : fill(L(RT.shareChanceNoneOne), { n: o.n })
  }
  return ''
}

/** One saved season as the profile's timeline shows it: its tag, worded as on the result page. */
export function bandOf(
  s: { zone: string; level?: Level; towards?: 'focal' | 'comparison' },
  lang: Lang = 'en',
): string {
  const level: Level =
    s.level ?? (s.zone === 'lean' ? 'moderate' : s.zone === 'none' ? 'none' : 'unread')
  return levelName(level, 'sex', s.towards, lang)
}
