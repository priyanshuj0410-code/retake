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
import { config, type ProfileReadingId } from '../engine/config'
import { fill } from '../engine/text'
import { PF, RT, SS, type Domain } from './content'
import { pc, positionOf, type Counts } from './range'
import { currentProfile } from './profile'
import { profileNow, walk } from './pool'
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

export interface CueCard {
  cue: Cue
  label: string
  level: string
  zone: 'lean' | 'none' | 'unread'
  meaning: string
}

/** One decision as a pair row (EVAL-12): who came first, beside whom, and the sentence it says. */
export interface PairView {
  context?: string
  first: string
  other: string
  relation: 'equal' | 'weaker'
  even?: boolean
  count?: string
  said: string
}

/** A count as a picture (EVAL-12): k of n, or two named parts. */
export interface TallyView {
  title?: string
  k?: number
  n?: number
  parts?: { label: string; n: number }[]
  caption?: string
  said: string
}

/**
 * One reading as a position-and-range line (EVAL-12): tagged only once its registered season
 * count is reached (config.season.profile.readings), otherwise untagged with a hollow point, the
 * range in words and "Tagged after N more seasons on your profile".
 */
export interface LineView {
  id: ProfileReadingId
  label: string
  status: string
  /** The status in a few words, for the at-a-glance strip: the tag, or "Tagged after N more seasons". */
  short: string
  tagged: boolean
  at: number
  lo: number
  hi: number
  point: 'solid' | 'hollow' | 'none'
  ends: { left: string; middle: string; right: string }
  words: string
  said: string
}

export interface DomainSection {
  domain: Domain
  title: string
  narrative: string
  /** Women and men on this area's own cards, as a line (EVAL-12): untagged until it opens. */
  line: LineView
  /** The same pairs as dots: filled the man first, a ring the woman first, dashed neither. */
  dots: { filled: number; rings: number; dashed: number; label: string; caption: string } | null
  /** Equal-description decisions shown as examples, with no lean label, while the headline is under possible. */
  examples: PairView[]
  followed: TallyView[]
  blind: { title: string; tally: TallyView | null; body?: string; pairs: PairView[] }[]
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
  /** A forming reading (the old "Not enough to tell"): no tag, the position, the next step. */
  unread: boolean
  forming: { next: string; words: string; left: string } | null
  /** What shows below the headline (owner decision 5, restored): see `sectionsBelow`. */
  sections: { others: boolean; areas: boolean }
  /** The women-and-men pairs: woman first, man first, even (the profile keeps them, EVAL-10). */
  counts: { w: number; m: number; e: number }
  /** Every profile reading's counts this season, for the profile's pooling (EVAL-12). */
  readings: Partial<Record<ProfileReadingId, Counts>>
  /** The one number to remember: k of n equal woman-and-man pairs went one way, and the dots. */
  hero: {
    big: string
    line: string
    pair: string
    dots: { filled: number; rings: number; dashed: number; label: string }
  } | null
  why: string[]
  /** The rival pairs behind the headline, as pair rows (EVAL-12). */
  whyPairs: PairView[]
  /** "At a glance" (EVAL-12): women and men, each area, skin tone and religion on one scale. */
  glance: LineView[]
  cards: CueCard[]
  domains: DomainSection[]
  share: string
  /** What "Include my result" adds to the card: the women-and-men tag and its chance line, nothing else. */
  shareResult: string
}

const DOMAINS: Domain[] = ['hiring', 'conduct', 'resources']
/** The cues a player is shown (owner decision O3): caste and birthplace are read for groups only. */
const SHOWN: Cue[] = ['sex', 'religion', 'tone']

/**
 * What the result page shows below the women-and-men headline (owner decision 5 and the owner's
 * always-show rule, EVAL-10): the other readings always show, each with its tag or "Still
 * forming"; the areas (which read the sex result decision by decision) only once the headline is
 * readable. A forming reading is never a dead end: its position, range and next step show above.
 */
export function sectionsBelow(
  sexUnread: boolean,
  otherZones: ('lean' | 'none' | 'unread')[],
): { others: boolean; areas: boolean } {
  void otherZones
  return { others: true, areas: !sexUnread }
}

/**
 * The seasons still to pool before an untagged reading can be tagged (EVAL-10, the research
 * critic; EVAL-12 pools them): the reading's registered count (config.season.profile.readings)
 * less the seasons pooled since the last restart, never projected per player; null when no count
 * meets the targets yet ("not available yet").
 */
export function seasonsToTag(pooledSeasons: number, id: ProfileReadingId = 'sex'): number | null {
  const opens = config.season.profile.readings.find((r) => r.id === id)?.opens ?? null
  if (opens === null) return null
  return Math.max(0, opens - pooledSeasons)
}

/** The "Tagged after ..." line for an untagged reading, from the seasons it still needs. */
export function toTagLine(toTag: number | null, lang: Lang): string {
  const L = (t: T) => t[lang]
  if (toTag === null) return L(RT.forming.notYet)
  if (toTag === 0) return L(RT.forming.pairs)
  return fill(L(toTag === 1 ? RT.forming.leftOne : RT.forming.left), { n: toTag })
}

/** A position on the line in words, from the edges in config (untagged.words); per cue since EVAL-12. */
function placeWord(x: number, lang: Lang, cue: Cue = 'sex'): string {
  const [a, b, c, d] = config.season.rating.untagged.words
  const k = x < a ? 0 : x < b ? 1 : x <= c ? 2 : x <= d ? 3 : 4
  if (cue === 'tone' || cue === 'religion') {
    const w = RT.rangeWordsCues[cue]
    return [w.mostlyLeft, w.slightlyLeft, w.equal, w.slightlyRight, w.mostlyRight][k][lang]
  }
  const keys = ['mostlyMen', 'slightlyMen', 'equal', 'slightlyWomen', 'mostlyWomen'] as const
  return RT.rangeWords[keys[k]][lang]
}

/** An untagged range in words: "Somewhere between slightly men-first and slightly women-first." */
export function rangeInWords(lo: number, hi: number, lang: Lang, cue: Cue = 'sex'): string {
  const [a, b] = [placeWord(lo, lang, cue), placeWord(hi, lang, cue)]
  return a === b
    ? fill(RT.rangeWords.around[lang], { a })
    : fill(RT.rangeWords.between[lang], { a, b })
}

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
  /* A forming reading (EVAL-10, owner): no tag, a warm heading, the position with its range. */
  const band = unread ? L(RT.forming.title) : levelName(h.level, 'sex', h.towards, lang)
  const body = fill(L(unread ? RT.forming[bandKey] : RT.tagBodies[bandKey]), {
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

  let hero: ResultModel['hero'] = null
  /* Always show the position (the owner's always-show rule): with no pairs at all, the whole
     line is the range. */
  const pos = positionOf({ w: womanAhead, m: manAhead, e: even }) ?? { at: 0.5, lo: 0, hi: 1, n: 0 }
  const ends = { left: L(RT.rangeLeft), middle: L(RT.rangeMiddle), right: L(RT.rangeRight) }
  const range: ResultModel['range'] = {
    ...pos,
    ends,
    caption: L(RT.rangeCaption),
    note: L(RT.rangeNote),
    label: fill(L(RT.rangeSaid), { at: pc(pos.at), lo: pc(pos.lo), hi: pc(pos.hi), tag: band }),
  }
  if (n > 0 && !unread) {
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
  }
  /* Untagged (EVAL-10): the range is the mark, said in words; pooled seasons so far (EVAL-12):
     this one and those an open profile pools since its last restart. */
  const saved = currentProfile()?.data.sessions.filter((x) => x.code !== run.code) ?? []
  const pooled = 1 + walk(saved).pooled.length
  const forming = unread
    ? {
        next: L(RT.forming.next),
        words: rangeInWords(pos.lo, pos.hi, lang),
        left: toTagLine(seasonsToTag(pooled), lang),
      }
    : null

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
  const whyPairs: PairView[] = []
  for (const e of [...byPair.values()]
    .filter((x) => x.n >= 2)
    .sort((x, y) => y.n - x.n)
    .slice(0, 2)) {
    if (e.wAhead === e.mAhead) {
      const said = fill(L(RT.whyPairEven), { a: name(e.w), b: name(e.m), k: e.wAhead, n: e.n })
      why.push(said)
      whyPairs.push({
        first: name(e.w),
        other: name(e.m),
        relation: 'equal',
        even: true,
        count: fill(L(RT.pairEach), { k: e.wAhead, n: e.n }),
        said,
      })
    } else {
      const favW = e.wAhead > e.mAhead
      whyPairs.push({
        first: name(favW ? e.w : e.m),
        other: name(favW ? e.m : e.w),
        relation: 'equal',
        count: fill(L(RT.heroNumber), { k: favW ? e.wAhead : e.mAhead, n: e.n }),
        said: fill(L(RT.whyPair), {
          a: name(e.w),
          b: name(e.m),
          fav: name(favW ? e.w : e.m),
          k: favW ? e.wAhead : e.mAhead,
          n: e.n,
        }),
      })
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
  /* The readings as lines (EVAL-12). The unlock rule: a reading is tagged only once the seasons
     pooled since the last restart (this one, and an open profile's) reach its registered count;
     women and men open at the first season, as before. A reading that opens through a profile
     is tagged from the pooled reading; every other one shows its range, hollow. */
  const seasonCounts = {
    ...readingCounts(people, rating.decisive, domainOf),
    sex: { w: womanAhead, m: manAhead, e: even },
  }
  const pooledNow = profileNow([...saved, { readings: seasonCounts }])
  const lineOf = (id: ProfileReadingId): LineView => {
    const cue: Cue = id === 'tone' || id === 'religion' ? id : 'sex'
    const p = positionOf(seasonCounts[id] ?? { w: 0, m: 0, e: 0 }) ?? {
      at: 0.5,
      lo: 0,
      hi: 1,
      n: 0,
    }
    const opens = config.season.profile.readings.find((r) => r.id === id)?.opens ?? null
    const pr = pooledNow.readings.find((r) => r.id === id)
    const tagged = id === 'sex' ? !unread : opens !== null && pooled >= opens && !!pr?.tagged
    const status =
      id === 'sex'
        ? band
        : tagged && pr
          ? levelName(pr.level, cue, pr.towards, lang)
          : fill(L(PF.forming), { left: toTagLine(seasonsToTag(pooled, id), lang) })
    const ends =
      cue === 'sex'
        ? { left: L(RT.rangeLeft), middle: L(RT.rangeMiddle), right: L(RT.rangeRight) }
        : { left: L(PF.ends[cue].left), middle: L(RT.rangeMiddle), right: L(PF.ends[cue].right) }
    const words = rangeInWords(p.lo, p.hi, lang, cue)
    const toTag = seasonsToTag(pooled, id)
    const short = tagged
      ? status
      : toTag === null
        ? L(PF.notAvailable)
        : toTag === 1
          ? L(RT.glanceLockedOne)
          : toTag === 0
            ? L(RT.forming.title)
            : fill(L(RT.glanceLocked), { n: toTag })
    return {
      id,
      label: L(PF.labels[id]),
      status,
      short,
      tagged,
      ...p,
      point: tagged ? 'solid' : config.season.rating.untagged.point,
      ends,
      words,
      said: `${L(PF.labels[id])}: ${status}. ${tagged ? '' : `${words} `}${fill(L(PF.lineSaid), {
        label: L(PF.labels[id]),
        right: ends.right.toLowerCase(),
        at: pc(p.at),
        lo: pc(p.lo),
        hi: pc(p.hi),
      })}`,
    }
  }
  const glance = (['sex', 'hiring', 'conduct', 'resources', 'tone', 'religion'] as const).map(
    lineOf,
  )
  const pairOf = (p: Pair): PairView => ({
    context: `${episode(p.beat)}, ${role(p.beat)}`,
    first: name(winner(p)),
    other: name(p.a === winner(p) ? p.b : p.a),
    relation: 'equal',
    said: fill(L(RT.cards.tied), {
      episode: episode(p.beat),
      role: role(p.beat),
      a: name(p.a),
      b: name(p.b),
      fav: name(winner(p)),
    }),
  })

  const domains: DomainSection[] = DOMAINS.map((d) => {
    const copy = RT.domains[d]
    const beats = peopleBeats(run).filter(({ i }) => run.isRating(i) && domainOf(i) === d)
    const pairs = rating.decisive.filter((p) => domainOf(p.beat) === d)
    const followed: TallyView[] = []
    const blind: DomainSection['blind'] = []
    let clearN = 0
    let clearK = 0
    const weak: PairView[] = []
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
            weak.push({
              context: `${episode(i)}, ${role(i)}`,
              first: name(b.chars[y].slot),
              other: name(b.chars[x].slot),
              relation: 'weaker',
              said: fill(L(RT.cards.weak), {
                episode: episode(i),
                role: role(i),
                weak: name(b.chars[y].slot),
                strong: name(b.chars[x].slot),
              }),
            })
        }
    }
    if (clearN > 0 && clearK / clearN >= config.season.rating.engagementMin)
      followed.push({
        k: clearK,
        n: clearN,
        caption: L(RT.cards.clearCaption),
        said: fill(L(RT.cards.clearBody), { k: clearK, n: clearN }),
      })
    if (weak.length >= 2)
      blind.push({
        title: L(RT.cards.weakTitle),
        tally: null,
        body: fill(L(RT.cards.weakBody), { k: weak.length }),
        pairs: weak.slice(0, 3),
      })
    const examples: PairView[] = []
    for (const cue of SHOWN) {
      const { real: focal, pool } = labelsOf[cue]
      const decided = pairs.filter(
        (p) => pool.has(p.a) && pool.has(p.b) && focal.has(p.a) !== focal.has(p.b) && p.adv !== 0,
      )
      /* Owner decision O2: an area names a lean on a cue only when that cue's headline is at
         least possible; otherwise its decisions are shown as examples, with no lean label. */
      const overall = cue === 'sex' ? h : rating.others.find((r) => r.cue === cue)
      if (!overall || !LEANING.includes(overall.level)) {
        if (cue === 'sex') examples.push(...decided.slice(0, 3).map(pairOf))
        continue
      }
      if (decided.length < minPairs) continue
      const fAhead = decided.filter((p) => focal.has(winner(p))).length
      const cAhead = decided.length - fAhead
      const words = RT.cues[cue]
      if (Math.max(fAhead, cAhead) / decided.length >= share) {
        const towards = fAhead > cAhead ? 'focal' : 'comparison'
        const g = cueGroup({ cue, towards }, lang)
        const k = Math.max(fAhead, cAhead)
        blind.push({
          title: fill(L(RT.cards.cueTitle), { group: g }),
          tally:
            cue === 'sex'
              ? null
              : {
                  k,
                  n: decided.length,
                  caption: fill(L(RT.cards.cueCaption), { group: g }),
                  said: fill(L(RT.cards.cueBody), { group: g, k, n: decided.length }),
                },
          pairs: decided
            .filter((p) => focal.has(winner(p)) === (towards === 'focal'))
            .slice(0, 3)
            .map(pairOf),
        })
      } else if (Math.abs(fAhead - cAhead) <= 1)
        followed.push({
          title: fill(L(RT.cards.evenTitle), { label: L(RT.cueShort[cue]) }),
          parts: [
            { label: L(words.firstFocal ?? words.focal), n: fAhead },
            { label: L(words.firstComparison ?? words.comparison), n: cAhead },
          ],
          said: fill(L(RT.cards.evenSaid), {
            a: L(words.focal),
            x: fAhead,
            b: L(words.comparison),
            y: cAhead,
          }),
        })
    }
    const c = seasonCounts[d]
    const n = c ? c.w + c.m + c.e : 0
    return {
      domain: d,
      title: L(copy.title),
      narrative: fill(L(copy.narrative), { n: beats.length, k: pairs.length }),
      line: lineOf(d),
      dots:
        c && n
          ? {
              filled: c.m,
              rings: c.w,
              dashed: c.e,
              label: fill(L(RT.heroDots), { n, m: c.m, w: c.w, e: c.e }),
              caption: fill(L(RT.areaDots), { n, m: c.m, w: c.w, e: c.e }),
            }
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
    forming,
    sections: sectionsBelow(
      unread,
      cards.filter((c) => c.cue !== 'sex').map((c) => c.zone),
    ),
    counts: { w: womanAhead, m: manAhead, e: even },
    readings: seasonCounts,
    hero,
    why: unread ? [] : why,
    whyPairs: unread ? [] : whyPairs,
    glance,
    cards,
    domains,
    share: shareText,
    shareResult,
  }
}

/**
 * A season's counts per profile reading (EVAL-12): over the equal-description pairs whose two
 * colleagues differ on the cue, how often the focal group's colleague came first, the comparison
 * group's, or neither. The areas count women and men on that area's own cards. Role has no
 * reading in this build.
 */
export function readingCounts(
  people: Parameters<typeof cueSets>[0],
  decisive: Pair[],
  domainOf: (beat: number) => Domain | null,
): Partial<Record<ProfileReadingId, Counts>> {
  const count = (pairs: Pair[], cue: Cue): Counts => {
    const { real, pool } = cueSets(people, cue)
    const c = { w: 0, m: 0, e: 0 }
    for (const p of pairs) {
      if (!pool.has(p.a) || !pool.has(p.b) || real.has(p.a) === real.has(p.b)) continue
      const s = real.has(p.a) ? p.adv : -p.adv
      if (s > 0) c.w += 1
      else if (s < 0) c.m += 1
      else c.e += 1
    }
    return c
  }
  const inArea = (d: Domain) => decisive.filter((p) => domainOf(p.beat) === d)
  return {
    sex: count(decisive, 'sex'),
    tone: count(decisive, 'tone'),
    religion: count(decisive, 'religion'),
    hiring: count(inArea('hiring'), 'sex'),
    conduct: count(inArea('conduct'), 'sex'),
    resources: count(inArea('resources'), 'sex'),
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
