/**
 * The season story (EVAL-4): its content, its draws, that consequences follow the notes only,
 * the attitude rating, its records, and the optional profile. Registered in scripts/check-all.ts.
 */
import { readFileSync } from 'node:fs'
import { identity, screeningItems, surveyItems } from '../src/content'
import { config, splitCap } from '../src/engine/config'
import { seeded } from '../src/engine/rng'
import { fill } from '../src/engine/text'
import {
  isPeople,
  PF,
  PRACTICE,
  RT,
  SS,
  stories,
  storyContent,
  storyById,
  poolOf,
} from '../src/story/content'
import { positionOf } from '../src/story/range'
import { carelessPlayer, fairPlayer, leaningPlayer, playSeason } from '../src/story/players'
import {
  addSession,
  changeOf,
  createProfile,
  deleteProfile,
  nextRetake,
  DEMO_PROFILE_CODE,
  openProfile,
  seedDemoProfile,
  setContact,
  setResearch,
  storiesPlayed,
  type ProfileSession,
} from '../src/story/profile'
import { estimateOf, pool, profileNow, rangeOf, walk } from '../src/story/pool'
import { cueSets, rate, weightOf } from '../src/story/rating'
import { sessionMinutes, StoryRunner } from '../src/story/runner'
import { drawCast } from '../src/story/session'
import { personLook } from '../src/story/looks'
import { castTiles, colleagueView } from '../src/story/view'
import { chanceLine, levelName, resultModel, sectionsBelow } from '../src/story/why'
import { store } from '../src/store'
import type { LocalStore } from '../src/store/local'
import { progress } from '../src/store/progress'
import { timeFields } from './no-timers'
import { record } from './lib/check'

const ROOT = new URL('..', import.meta.url).pathname
const N = Number(process.env.STORY_N ?? 200)

export async function run() {
  content()
  draws()
  slotsAndFaces()
  levels()
  backAndEdits()
  chapters()
  consequences()
  rating()
  await records()
  await profile()
  await prototypePass()
  await profilePooling()
}

function content() {
  const T = 'X-10 season story: content'
  const wh = storyById('warehouse')
  const beats = wh?.beats ?? []
  record(
    T,
    'three seasons offered, each with a drawn cover panel (no emoji); the warehouse built, the newsroom and the clinic stubbed with their pending marker in a _pending note, never in the premise',
    stories.length === 3 &&
      !!wh?.built &&
      stories.every((s) => ['warehouse', 'newsroom', 'clinic'].includes(s.art)) &&
      stories
        .filter((s) => !s.built)
        .every(
          (s) =>
            /PENDING v18/.test((s as unknown as { _pending?: string })._pending ?? '') &&
            !/PENDING/.test(JSON.stringify(s.premise)),
        ),
  )
  const ppl = beats.filter(isPeople)
  const rating = ppl.filter((b) => !b.mascot && b.form !== 'B')
  const byDom = (d: string) => rating.filter((b) => b.domain === d)
  const res = byDom('resources')
  const formB = ppl.filter((b) => b.form === 'B')
  const C = config.season.counted
  record(
    T,
    `the owner's 80 counted decisions: ${ppl.filter((b) => b.mascot).length} mascot cards, ${config.season.faking.screening.length} screening items, ${2 * config.season.faking.survey.length + formB.length + 1} faking-test decisions, ${rating.length} rating cards (PENDING v18)`,
    ppl.filter((b) => b.mascot).length === C.mascot &&
      config.season.faking.screening.length === C.screening &&
      2 * config.season.faking.survey.length + formB.length + 1 === C.faking &&
      rating.length === C.rating &&
      C.mascot + C.screening + C.faking + C.rating === C.total &&
      C.total === 80,
  )
  record(
    T,
    `19 rating cards per domain (hiring ${byDom('hiring').length}, conduct ${byDom('conduct').length}, resources ${res.length}: allocation ${res.filter((b) => b.family !== 'npt').length}, unwanted work ${res.filter((b) => b.family === 'npt').length})`,
    ['hiring', 'conduct', 'resources'].every((d) => byDom(d).length === C.perDomain) &&
      res.filter((b) => b.family === 'npt').length === 8 &&
      res.every((b) => b.kind === 'split'),
  )
  record(
    T,
    'form B: 6 cards after the note, 3 promotion and 3 conduct, all in the last episode; the mascot cards preview all three domains',
    formB.length === 6 &&
      formB.filter((b) => b.domain === 'hiring').length === 3 &&
      formB.filter((b) => b.domain === 'conduct').length === 3 &&
      formB.every((b) => b.episode === (wh?.episodes?.length ?? 0)) &&
      new Set(ppl.filter((b) => b.mascot).map((b) => b.domain)).size === 3,
  )
  record(
    T,
    'the screening and survey items exist, and each survey administration is keyed two and two within each family',
    config.season.faking.screening.every((id) => screeningItems.some((i) => i.id === id)) &&
      ['opportunity', 'conduct'].every((f) => {
        const its = config.season.faking.survey.map((id) => surveyItems.find((i) => i.id === id))
        const fam = its.filter((i) => i?.family === f)
        return fam.length === 2 && new Set(fam.map((i) => i?.keying)).size === 2
      }),
  )
  record(
    T,
    'caste and birthplace ride on one-off characters (applicants, complainants, vendors) in every domain, PENDING v18',
    ['hiring', 'conduct', 'resources'].every((d) => byDom(d).some((b) => b.shape === 'oneoff')) &&
      config.season.cueCarriers.oneOff.join() === 'caste,birthplace' &&
      config.season.cueCarriers.cast.join() === 'sex,religion,tone',
  )
  record(
    T,
    'beat and description ids unique',
    new Set(beats.map((b) => b.id)).size === beats.length &&
      new Set(beats.filter(isPeople).flatMap((b) => b.descriptions.map((d) => d.id))).size ===
        beats.filter(isPeople).reduce((a, b) => a + b.descriptions.length, 0),
  )
  const shapeOk = beats.filter(isPeople).every((b) => {
    const tiers = b.descriptions
      .map((d) => d.tier)
      .sort()
      .join('')
    const keys = Object.keys(b.after).sort().join(',')
    if (b.kind === 'rank')
      return tiers === '1133' && keys === '1,3' && ['mixed', 'same', 'oneoff'].includes(b.shape)
    if (b.kind === 'pick' && b.shape === 'clear') return tiers === '13' && keys === '1,3'
    if (b.kind === 'pick')
      return (
        tiers === '22' &&
        keys === '2' &&
        ['rival', 'same', 'oneoff'].includes(b.shape) &&
        (b.shape !== 'oneoff' || !!b.cue)
      )
    return (
      tiers === '133' &&
      keys === '1,3,even' &&
      ['rival', 'oneoff'].includes(b.shape) &&
      (b.shape !== 'oneoff' || !!b.cue) &&
      (b.pool ?? 0) > 0 &&
      !!b.unit
    )
  })
  /* Split pools (EVAL-10, owner: "why is it always 6?"): every split sets its own pool, with no
     default; the pools vary with what is shared and no value covers more than about a quarter of
     the cards; the cap (about two thirds of the pool) always allows an even split when the pool
     divides by 3 and a near-even one otherwise; scoring reads shares, never raw units. */
  const splitBeats = stories
    .flatMap((st) => (st.beats ?? []).filter(isPeople))
    .filter((b) => b.kind === 'split')
  const pools = splitBeats.map((b) => b.pool)
  const counts = new Map<number, number>()
  for (const p of pools) if (p) counts.set(p, (counts.get(p) ?? 0) + 1)
  const most = Math.max(...counts.values())
  const capOk = [...counts.keys()].every((p) => {
    const c = splitCap(p)
    return 3 * c >= p && c >= Math.ceil(p / 3) && c < p
  })
  const runnerSrc = readFileSync(`${ROOT}src/story/runner.ts`, 'utf8')
  const ratingSrc = readFileSync(`${ROOT}src/story/rating.ts`, 'utf8')
  record(
    T,
    `every split sets its own pool (${[...counts.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([p, n]) => `${p}: ${n}`)
      .join(
        ', ',
      )}), none covers more than 30 per cent of the ${splitBeats.length} cards, the cap allows an even or near-even split, no code falls back to a default pool, and scoring reads shares (units over the total) or the sign of a difference, never raw units`,
    pools.every((p) => typeof p === 'number' && p >= 4 && p <= 12) &&
      counts.size >= 5 &&
      most / splitBeats.length <= 0.3 &&
      capOk &&
      !/pool \?\? \d/.test(
        readFileSync(`${ROOT}src/screens/Story.tsx`, 'utf8') +
          readFileSync(`${ROOT}src/story/players.ts`, 'utf8'),
      ) &&
      /a\.units\.map\(\(u\) => u \/ total\)/.test(runnerSrc) &&
      /Math\.sign\(ans\.units\[a\] - ans\.units\[b\]\)/.test(ratingSrc),
  )
  record(
    T,
    'every people beat has the descriptions, tiers and consequences its tie structure needs',
    shapeOk,
  )
  record(
    T,
    'ordinary beats have three options with consequences',
    beats.filter((b) => !isPeople(b)).every((b) => !isPeople(b) && b.options.length === 3),
  )
  record(
    T,
    'descriptions carry no pronoun and no token',
    beats
      .filter(isPeople)
      .every((b) =>
        b.descriptions.every(
          (d) =>
            !/\b(he|she|his|her|him|they|their|them)\b/i.test(d.text.en) &&
            !/\{/.test(d.text.en + d.text.hinglish),
        ),
      ),
  )
  record(
    T,
    'consequences use only {name} and {g:}, and the even split names nobody',
    beats
      .filter(isPeople)
      .every((b) =>
        Object.entries(b.after).every(
          ([k, t]) =>
            !/\{(?!name\}|g:)/.test(t.en + t.hinglish) &&
            (k !== 'even' || !/\{name\}/.test(t.en + t.hinglish)),
        ),
      ),
  )
  const texts: string[] = []
  const collect = (v: unknown, key = ''): void => {
    if (key.startsWith('_') || key === 'consentNote') return
    if (typeof v === 'string') texts.push(v)
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) collect(x, k)
  }
  collect(storyContent)
  record(
    T,
    'no story text says "fair", "bias", "biased" or "unbiased"',
    texts.every((s) => !/\b(fair|unfair|bias|biased|unbiased)\b/i.test(s)),
    texts
      .filter((s) => /\b(fair|bias)/i.test(s))
      .slice(0, 3)
      .join(' | '),
  )
  record(
    T,
    'every story text has English and Hinglish',
    JSON.stringify(storyContent).split('"en":').length ===
      JSON.stringify(storyContent).split('"hinglish":').length,
  )
  record(
    T,
    'the content is marked PENDING v18, and every pendingV18 key exists in config.season',
    storyContent.status === 'PENDING v18' &&
      config.season.pendingV18.every(
        (k) =>
          k
            .split('.')
            .reduce<unknown>((o, p) => (o as Record<string, unknown>)?.[p], config.season) !==
          undefined,
      ),
  )
  /* The five tags (EVAL-10, owner): exact words, both directions fill, no band called unbiased
     or fair, no "lean" or "chance would explain" left, nothing pending in player copy. */
  const tagEn = Object.values(RT.tags).map((t) => t.en)
  record(
    T,
    'the five tags read "Clear pattern: men first", "Pattern: men first more often", "Maybe a pattern: men first a little more often", "No pattern: women and men first about equally" and, for other cues, "Still forming" (the always-show rule); no tag is unbiased or fair, and no result copy says "lean", "chance would explain" or "shaded middle"',
    levelName('strong', 'sex', 'comparison', 'en') === 'Clear pattern: men first' &&
      levelName('moderate', 'sex', 'comparison', 'en') === 'Pattern: men first more often' &&
      levelName('possible', 'sex', 'comparison', 'en') ===
        'Maybe a pattern: men first a little more often' &&
      levelName('none', 'sex', undefined, 'en') ===
        'No pattern: women and men first about equally' &&
      levelName('unread', 'sex', undefined, 'en') === 'Still forming' &&
      levelName('moderate', 'sex', 'focal', 'en') === 'Pattern: women first more often' &&
      tagEn.every((b) => !/unbiased|fair/i.test(b)) &&
      !/\blean|chance would explain|shaded middle|attitude rating/i.test(
        JSON.stringify(storyContent.rating, (k, v) => (k.startsWith('_') ? undefined : v)).replace(
          /"\w+":/g,
          '',
        ),
      ),
  )
  /* The share card (EVAL-10, owner): by default the season only; "Include my result" adds the
     women-and-men tag and a chance line from config, and never religion or skin tone. */
  const card = fill(RT.shareCard.en, {
    title: 'The warehouse',
    decisions: 77,
    chapters: 5,
    cast: 8,
  })
  const chance = (['strong', 'moderate', 'possible', 'none'] as const).map((k) =>
    chanceLine(k, 'en'),
  )
  const words = ['religion', 'tone']
    .flatMap((c) => Object.values(RT.cues[c]).flatMap((t) => [t.en, t.hinglish]))
    .map((w) => w.toLowerCase())
  record(
    T,
    'the share card names the season only ("I played Team Season: ... Try it yourself."), with no score; the result adds the tag and a chance line worked out from the reading levels in config; no share text names religion or skin tone',
    card ===
      'I played Team Season: The warehouse. 77 decisions, 5 chapters, 8 colleagues. Try it yourself.' &&
      !/\d+ ?(per cent|%)|score|rank/i.test(RT.shareCard.en.replace(/\{\w+\}/g, '')) &&
      chance.every((c) => c.length > 0 && !/\{/.test(c)) &&
      chanceLine('moderate', 'en').includes(
        String(Math.round(1 / (1 - config.season.rating.levels.moderate))),
      ) &&
      chanceLine('unread', 'en') === '' &&
      [RT.shareCard, RT.shareResult, RT.shareChancePattern, RT.shareChanceMany, RT.shareChanceNone]
        .flatMap((t) => [t.en, t.hinglish])
        .every((t) => words.every((w) => !t.toLowerCase().includes(w))),
  )
  const doms = Object.values(RT.domains)
  record(
    T,
    "the result page has the owner's areas (hiring and promotion, complaints and conduct, sharing resources), each with 3 or 4 reflection prompts and 3 or 4 habits (no effect claimed; sources pending in a _watchPending note), and the Internal Committee line",
    doms.length === 3 &&
      doms.every(
        (d) =>
          d.origin.length >= 3 &&
          d.origin.length <= 4 &&
          d.watch.length >= 3 &&
          d.watch.length <= 4,
      ) &&
      /PENDING v18/.test(RT._watchPending as unknown as string) &&
      /We have not tested whether they work/.test(RT.watchBody.en) &&
      /Internal Committee/.test(RT.committee.en),
  )
  const eps = wh?.episodes ?? []
  const perEp = eps.map(
    (_, k) =>
      beats.filter((b) => isPeople(b) && b.episode === k + 1 && !b.mascot && b.form !== 'B').length,
  )
  record(
    T,
    `4 or 5 episodes with a title card each, 9 to 13 rating cards each, an interlude in each (PENDING v18: ${perEp.join(', ')})`,
    eps.length >= 4 &&
      eps.length <= 5 &&
      eps.length === config.season.episodes &&
      perEp.every((x) => x >= 9 && x <= 13) &&
      eps.every(
        (e) =>
          !!e.title.en &&
          !!e.premise.en &&
          !!e.interlude &&
          beats.some((b) => b.id === e.interlude?.after),
      ),
  )
  record(
    T,
    'every interlude is a strip of 2 or 3 drawn panels, each with a caption in both languages',
    eps.every(
      (e) =>
        !!e.interlude &&
        e.interlude.panels.length >= 2 &&
        e.interlude.panels.length <= 3 &&
        e.interlude.panels.every((p) => !!p.art && !!p.text.en && !!p.text.hinglish),
    ),
  )
  record(
    T,
    'the complaint episode says sexual harassment goes to the Internal Committee, not a team lead',
    eps.some((e) => /Internal Committee/.test(e.premise.en)),
  )
  record(
    T,
    'reading levels, the hero, its dots and every result visual (at a glance, tallies, pair rows, columns, range lines) use neutral colour tokens, never green or red',
    ![
      'readinglist',
      'resulthero',
      'dotgrid',
      'glance',
      'tally',
      'pairs',
      'columns',
      'rangeline',
      'trend',
    ].some((f) =>
      /teal|coral|green|red\b|--c-ok|--c-error|--violet|--c-accent/.test(
        readFileSync(`${ROOT}src/ui/${f}.css`, 'utf8'),
      ),
    ),
  )
  record(
    T,
    'no "how accurate was this?" self-rating on the result page',
    !/accurate|accuracy/i.test(JSON.stringify(storyContent.rating)),
  )
  record(
    T,
    'no season screen falls back to the old card components (emoji Character, Allocate steppers, SortList drag rows)',
    !/\b(Character|Allocate|SortList)\b/.test(readFileSync(`${ROOT}src/screens/Story.tsx`, 'utf8')),
  )
  record(
    T,
    'the disarming opening is short: two or three sentences in each language',
    (['en', 'hinglish'] as const).every((l) => {
      const n = (RT.opening[l].match(/[.!?](\s|$)/g) ?? []).length
      return n >= 2 && n <= 3
    }),
  )
  const story = readFileSync(`${ROOT}src/screens/Story.tsx`, 'utf8')
  const order = [
    'RT.opening',
    '<Glance',
    '<ResultHero',
    'RT.areasTitle',
    'RT.followedTitle',
    'RT.blindTitle',
    'RT.originTitle',
    'RT.watchTitle',
    'RT.committee',
    '<KeepIt',
    'RT.shareTitle',
    '<StayInTouch',
  ]
  const at = order.map((s) => story.indexOf(s, story.indexOf('export function StoryResult')))
  record(
    T,
    "the result page renders its sections in the owner's order: the short disarming opening first, then every reading at a glance (EVAL-12), the one number with its dots and band, the folded areas and the rest",
    at.every((x, i) => x > 0 && (i === 0 || x > at[i - 1])),
    at.join(','),
  )
  record(
    T,
    'the profile offers a separate research consent (pending v18 in a _researchConsentPending note, not on screen), the delete-everything action, "Your decisions changed" or "No change shown" with the chance line (EVAL-12)',
    !/PENDING/.test(JSON.stringify([PF.researchTitle, PF.researchConsent])) &&
      /PENDING v18/.test(PF._researchConsentPending as unknown as string) &&
      PF.deleteButton.en === 'Delete my profile and all my records' &&
      PF.changed.en === 'Your decisions changed' &&
      PF.noChange.en === 'No change shown' &&
      /by chance/.test(PF.timelineNote.en),
  )
  const run = wh ? new StoryRunner(seeded(1), wh, ['en']) : null
  const secs = run ? run.estimateSeconds() : 0
  record(
    T,
    `the session takes about 26 minutes at the scenario's per-type paces, PENDING v18 (${(secs / 60).toFixed(1)} min; ${run?.asked} decisions asked at 12 to 20 s each: ${(((run?.asked ?? 0) * 12) / 60).toFixed(1)} to ${(((run?.asked ?? 0) * 20) / 60).toFixed(1)} min)`,
    secs / 60 >= 22 && secs / 60 <= 30,
  )
}

function draws() {
  const T = 'X-11 season story: the cast and the draws'
  const wh = storyById('warehouse')
  if (!wh) return
  const bad: string[] = []
  for (let s = 1; s <= N; s++) {
    const r = new StoryRunner(seeded(s), wh, ['en'])
    const cast = r.cast
    const sexes = (x: string) => cast.filter((c) => c.sex === x)
    if (sexes('woman').length !== 4 || sexes('man').length !== 4) bad.push(`${s}: sexes`)
    if (new Set(cast.map((c) => c.species)).size !== 8) bad.push(`${s}: species`)
    if (
      new Set(cast.map((c) => c.mascot)).size !== 8 ||
      !cast.every((c) => identity.neutralNames.includes(c.mascot))
    )
      bad.push(`${s}: mascots`)
    if (new Set(cast.map((c) => c.name)).size !== 8) bad.push(`${s}: names`)
    for (const sx of ['woman', 'man']) {
      const g = sexes(sx)
      const hindu = g.filter((c) => c.religion === 'hindu')
      const muslim = g.filter((c) => c.religion === 'muslim')
      if (hindu.length !== 2 || muslim.length !== 2) bad.push(`${s}: religion`)
      if (
        hindu.filter((c) => c.tone === 'darker').length !== 1 ||
        muslim.filter((c) => c.tone === 'darker').length !== 1
      )
        bad.push(`${s}: tone`)
      if (g.some((c) => c.surname || c.born || c.caste))
        bad.push(`${s}: cast carries caste or birthplace`)
    }
    /* One-offs: each carries caste or birthplace, never both, at the medium tone. */
    for (const x of r.season.extras)
      if (
        !x.oneOff ||
        x.tone !== 'constant' ||
        !!x.caste === !!x.born ||
        (x.caste && x.religion !== 'hindu') ||
        (x.born && x.religion !== 'muslim')
      )
        bad.push(`${s}: one-off ${x.name}`)
    if (!cast.every((c) => cast[c.rival].sex !== c.sex && cast[c.rival].rival === c.slot))
      bad.push(`${s}: rivals`)
    const pairCount = new Map<string, number>()
    for (const b of r.season.beats) {
      if (b.kind !== 'people') continue
      const tied = (t: number) => b.chars.filter((c) => c.tier === t).map((c) => r.person(c.slot))
      const shape = b.beat.shape
      if (b.beat.kind === 'rank' && shape === 'mixed')
        for (const t of [3, 1]) {
          const [a, c] = tied(t)
          if (a.rival !== c.slot) bad.push(`${s} ${b.beat.id}: tied pair not rivals`)
          if (!b.beat.mascot)
            pairCount.set(
              `m${Math.min(a.slot, c.slot)}`,
              (pairCount.get(`m${Math.min(a.slot, c.slot)}`) ?? 0) + 1,
            )
        }
      if (b.beat.kind === 'rank' && shape === 'same')
        for (const t of [3, 1]) {
          const [a, c] = tied(t)
          if (a.sex !== c.sex) bad.push(`${s} ${b.beat.id}: same-sex tie broken`)
        }
      if (shape === 'rival') {
        const [a, c] = tied(b.beat.kind === 'pick' ? 2 : 3)
        if (a.rival !== c.slot) bad.push(`${s} ${b.beat.id}: rival tie not rivals`)
        if (b.beat.kind === 'pick' && !b.beat.mascot)
          pairCount.set(
            `p${Math.min(a.slot, c.slot)}`,
            (pairCount.get(`p${Math.min(a.slot, c.slot)}`) ?? 0) + 1,
          )
      }
      if (shape === 'oneoff') {
        const tiers = b.beat.kind === 'rank' ? [3, 1] : [b.beat.kind === 'pick' ? 2 : 3]
        const kinds = tiers.map((tr) => {
          const [a, c] = tied(tr)
          if (!a.oneOff || !c.oneOff || a.sex !== c.sex)
            bad.push(`${s} ${b.beat.id}: one-off tie broken`)
          if (a.caste && c.caste && a.caste !== c.caste) return 'caste'
          if (a.born && c.born && a.born.region !== c.born.region) return 'born'
          bad.push(`${s} ${b.beat.id}: one-off tie does not differ on its cue`)
          return ''
        })
        if (b.beat.kind === 'rank' && kinds.sort().join() !== 'born,caste')
          bad.push(`${s} ${b.beat.id}: ranks need one of each`)
        if (b.beat.kind !== 'rank' && kinds[0] !== b.beat.cue)
          bad.push(`${s} ${b.beat.id}: wrong cue`)
      }
      if (b.beat.kind === 'pick' && shape === 'same') {
        const [a, c] = tied(2)
        if (a.sex !== c.sex) bad.push(`${s} ${b.beat.id}: same pick mixed`)
      }
    }
    const counts = [...pairCount.entries()]
    const even = (prefix: string) => {
      const ns = counts.filter(([k]) => k.startsWith(prefix)).map(([, n]) => n)
      return ns.length === 4 && Math.max(...ns) - Math.min(...ns) <= 1
    }
    if (!even('m') || !even('p'))
      bad.push(`${s}: rival pairs not balanced ${JSON.stringify(counts)}`)
  }
  record(
    T,
    `${N} seeded seasons: a cast of 4 women and 4 men, 8 different animals and mascots, religion and tone balanced within sex, no caste or birthplace on the cast; one-offs carry caste or birthplace, never both, at the medium tone; rival pairs of a woman and a man`,
    bad.filter((b) => !/tie|rival pairs/.test(b)).length === 0,
    bad.slice(0, 4).join(' | '),
  )
  record(
    T,
    'tied notes always go to the tied colleagues (rival pairs on mixed ranks, rival picks and splits; same sex on same-shape beats; one-off pairs of one sex differing on their cue), and after the reveal the four rival pairs meet equally often (within one) in ranks and in picks',
    bad.filter((b) => /tie|rival pairs/.test(b)).length === 0,
    bad
      .filter((b) => /tie|rival pairs/.test(b))
      .slice(0, 4)
      .join(' | '),
  )
  /* Cues drawn independently of the beat draws: the cast for a seed does not depend on the story. */
  record(
    T,
    'the cast draw uses the identity pools only',
    drawCast(seeded(7)).every((c) =>
      (identity.firstNames as Record<string, Record<string, string[]>>)[c.religion][c.sex].includes(
        c.name,
      ),
    ),
  )
}

/** EVAL-6: sex drawn per slot, and the one-off faces off the cue. */
function slotsAndFaces() {
  const T = 'X-11 season story: the cast and the draws'
  const wh = storyById('warehouse')
  if (!wh) return
  const women = Array<number>(8).fill(0)
  let ordered = true
  let focalLow = 0
  let pairsN = 0
  let samePair = true
  for (let s = 1; s <= N; s++) {
    const r = new StoryRunner(seeded(s), wh, ['en'])
    if (!r.cast.every((c, i) => c.slot === i)) ordered = false
    r.cast.forEach((c) => (women[c.slot] += c.sex === 'woman' ? 1 : 0))
    for (const b of r.season.beats) {
      if (b.kind !== 'people' || b.beat.shape !== 'oneoff') continue
      for (const tier of [1, 2, 3]) {
        const tied = b.chars.filter((c) => c.tier === tier).map((c) => r.person(c.slot))
        if (tied.length !== 2) continue
        const [x, y] = tied
        const focal = (m: typeof x) =>
          m.caste ? m.caste === 'sc-coded' : m.born?.region === 'south'
        if (focal(x) === focal(y)) continue
        const [lx, ly] = [personLook(x), personLook(y)]
        if (lx.glasses !== ly.glasses || lx.facial !== ly.facial) samePair = false
        pairsN += 1
        if (focal(x.slot < y.slot ? x : y)) focalLow += 1
      }
    }
  }
  const share = women.map((w) => w / N)
  record(
    T,
    `sex is drawn per slot: every slot is a woman in 35 to 65 per cent of ${N} casts (${share.map((x) => Math.round(x * 100)).join(', ')}), always 4 and 4, and the cast is held in slot order`,
    ordered && share.every((x) => x >= 0.35 && x <= 0.65),
  )
  record(
    T,
    `one-off tied pairs: the focal cue lands on the lower slot in 40 to 60 per cent of pairs (${pairsN ? Math.round((100 * focalLow) / pairsN) : 0} per cent of ${pairsN}), so no face sits on one side`,
    pairsN > 100 && focalLow / pairsN >= 0.4 && focalLow / pairsN <= 0.6,
  )
  record(
    T,
    'both faces of a one-off tied pair share glasses and facial hair (they differ only on the cue)',
    samePair,
  )
}

/** Owner decisions O2 (five levels, size shown apart) and O3 (caste and birthplace for groups only). */
function levels() {
  const T = 'X-13 the attitude rating on 57 cards (thresholds PENDING v18)'
  const { strong, moderate, possible } = config.season.rating.levels
  record(
    T,
    `five levels from three permutation quantiles in config (demo ${strong}, ${moderate}, ${possible}), ordered, and no threshold in player copy`,
    strong > moderate &&
      moderate > possible &&
      !/0\.99|0\.95|0\.85|quantile|permutation|PENDING/i.test(
        JSON.stringify([RT.tags, RT.tagBodies, RT.rangeNote, RT.rangeSaid], (k, v) =>
          k.startsWith('_') ? undefined : v,
        ),
      ),
  )
  const seen = new Set<string>()
  let caste = 0
  let gated = true
  for (let s = 1; s <= 60; s++) {
    for (const t of [fairPlayer, leaningPlayer, { cueWeight: 0.6, noise: 0.3, careless: false }]) {
      const r = playSeason(s, t)
      const m = resultModel(r)
      const lv = m.rating.headline.level
      seen.add(lv)
      if (m.cards.some((c) => c.cue === 'caste' || c.cue === 'birthplace')) caste += 1
      if (
        m.domains.some((d) => /urname|irthplace|born/i.test(d.blind.map((b) => b.title).join(' ')))
      )
        caste += 1
      const leaning = lv === 'strong' || lv === 'moderate' || lv === 'possible'
      /* The unlock rule (EVAL-12): on a first season only women and men can be tagged; every
         area, skin tone and religion line is hollow, untagged, with its seasons-to-tag line. */
      const locked = m.glance.filter((g) => g.id !== 'sex')
      if (
        locked.some(
          (g) => g.tagged || g.point === 'solid' || !/Tagged after|not available/i.test(g.status),
        ) ||
        m.domains.some((d) => d.line.tagged || /Pattern|pattern/.test(d.line.status))
      )
        gated = false
      if (leaning && m.band !== levelName(lv, 'sex', m.rating.headline.towards, 'en')) gated = false
      /* A forming reading (EVAL-10, always-show): no tag, no dots, no reasons, but always the
         range, said in words, and the next step. */
      if (
        m.unread &&
        (m.hero || !m.range || m.why.length || !m.forming?.words || m.band !== RT.forming.title.en)
      )
        gated = false
      if (!m.unread && m.range && !(m.range.lo <= m.range.at && m.range.at <= m.range.hi))
        gated = false
    }
  }
  record(
    T,
    `seeded players reach the levels (${[...seen].join(', ')}); on a first season no area, skin tone or religion line is tagged (the unlock rule, EVAL-12). Known (PENDING v20): with 70 balanced relabellings the smallest p is 2/70, so strong (p at most ${(1 - strong).toFixed(2)}) cannot be reached on the cast cues`,
    seen.has('moderate') && seen.has('possible') && seen.has('none') && gated,
  )
  record(
    T,
    'caste and birthplace are never read per person on the result page (owner decision O3): no card, no area card',
    caste === 0,
  )
}

/** The season in five chapters and a finale, story in the card, pairs, the map (EVAL-8, PENDING v21). */
function chapters() {
  const T = 'X-19 chapters, story in the card, the season map (EVAL-8; splits again since EVAL-10)'
  const wh = storyById('warehouse')
  if (!wh) return
  const ch = config.season.chapters
  const r = new StoryRunner(seeded(11), wh, ['en'])
  const kinds = r.steps.map((s) => s.kind)
  const fin = r.chapters + 1
  const saved = r.steps.flatMap((s, k) => (s.kind === 'saved' ? [r.chapterOf[k]] : []))
  record(
    T,
    `${ch.count} story chapters, each ending on a payoff strip then a save screen, then a finale`,
    r.chapters === ch.count &&
      JSON.stringify(saved) === JSON.stringify([...Array(ch.count).keys()].map((i) => i + 1)) &&
      r.steps.every((s, k) => s.kind !== 'saved' || r.steps[k - 1]?.kind === 'payoff'),
    saved.join(','),
  )
  const finale = r.steps.filter((_, k) => r.chapterOf[k] === fin).map((s) => s.kind)
  const order = [
    'screening',
    'fsurvey',
    'note',
    'beat',
    'fsurvey',
    'recall',
    'probe',
    'wrap',
    'demographics',
    'close',
  ]
  const squash = finale.filter((x, k) => x !== finale[k - 1] || x !== 'beat')
  record(
    T,
    'the finale: screening, survey, note, form B, survey again, recall, the wrap on one screen, then debrief, code and submit on one screen; no save screen inside it',
    JSON.stringify(squash) === JSON.stringify(order),
    squash.join(','),
  )
  const formAInFinale = r.steps.some(
    (s, k) =>
      s.kind === 'beat' &&
      r.chapterOf[k] === fin &&
      !(
        r.season.beats[s.i].kind === 'people' &&
        (r.season.beats[s.i].beat as { form?: string }).form === 'B'
      ),
  )
  const formBBefore = r.steps.some(
    (s, k) =>
      s.kind === 'beat' &&
      r.chapterOf[k] <= r.chapters &&
      (r.season.beats[s.i].beat as { form?: string }).form === 'B',
  )
  record(
    T,
    'every form-A card comes before the finale, and every form-B card is in it',
    !formAInFinale && !formBBefore,
  )
  record(
    T,
    'no episode splash, interlude, separate prior item, debrief, code or submit screen remains',
    !kinds.some((k) => ['episode', 'interlude', 'prior', 'debrief', 'code', 'submit'].includes(k)),
  )
  const ordinary = r.season.beats.filter((b) => b.kind === 'ordinary').map((b) => b.beat.id)
  record(
    T,
    `ordinary decisions back to the registered ${ch.ordinaryKept.length}: ${ch.ordinaryKept.join(', ')}`,
    JSON.stringify(ordinary) === JSON.stringify(ch.ordinaryKept),
    ordinary.join(', '),
  )
  const long = (wh.episodes ?? []).filter(
    (e) =>
      !e.opening ||
      e.opening.en.split(/\s+/).length > ch.captionWords ||
      e.opening.hinglish.split(/\s+/).length > ch.captionWords + 5,
  )
  record(
    T,
    `every chapter's opening, folded into its first card's caption, is ${ch.captionWords} words or fewer`,
    long.length === 0,
    long.map((e) => e.title.en).join(', '),
  )
  const splits = r.season.beats.filter((b) => b.kind === 'people' && b.beat.kind === 'split')
  record(
    T,
    `every share goes to three colleagues: a tied pair and a third with weaker descriptions (${splits.length} cards; EVAL-10 reverted the one-tap pairs)`,
    splits.length > 0 &&
      splits.every((b) => {
        if (b.kind !== 'people' || b.chars.length !== 3) return false
        const tiers = b.chars.map((c) => c.tier).sort()
        return tiers[1] === tiers[2] && tiers[0] < tiers[1]
      }),
  )
  /* Payoffs: the same for every player and never contingent on answers: the strip names only
     the two configured cast slots, and the screen fills nothing else into it. */
  const panels = (wh.episodes ?? []).flatMap((e) => e.payoff)
  const view = readFileSync(`${ROOT}src/screens/Story.tsx`, 'utf8')
  const payoffCase = view.slice(view.indexOf("case 'payoff'"), view.indexOf("case 'saved'"))
  record(
    T,
    'each chapter ends on a three-panel payoff strip naming the same two cast slots for every player, never an answer',
    panels.length === 3 * (wh.episodes ?? []).length &&
      panels.every((p) => !/\{(?!a\}|b\})[^}]*\}/.test(p.text.en + p.text.hinglish)) &&
      /config\.season\.chapters\.payoffSlots/.test(payoffCase) &&
      !/answers|consequence|lead\(|records\(/.test(payoffCase),
  )
  /* Sittings: a count on the record, 1 to the configured maximum, never a time. */
  const q = new StoryRunner(seeded(12), wh, ['en'])
  for (let i = 0; i < 20; i++) q.newSitting()
  record(
    T,
    `the sittings count is capped at ${ch.sittingsMax}, starts at 1, and survives a reload (snapshot)`,
    q.sittings === ch.sittingsMax &&
      new StoryRunner(seeded(12), wh, ['en']).sittings === 1 &&
      (() => {
        const z = new StoryRunner(seeded(12), wh, ['en'])
        z.restore(q.snapshot())
        return z.sittings === ch.sittingsMax
      })(),
  )
  /* The save expires unsent after the configured days (the time stays on the device). */
  progress.put('x19', { entry: 1, finished: null })
  const day = 86_400_000
  const kept =
    progress.fresh('x19', ch.saveDays, Date.now() + (ch.saveDays - 1) * day).value !== null
  const gone = progress.fresh('x19', ch.saveDays, Date.now() + (ch.saveDays + 1) * day)
  record(
    T,
    `a save resumes within ${ch.saveDays} days and is deleted unsent after them`,
    kept && gone.expired && gone.value === null && progress.get('x19') === null,
  )
  /* Back never leaves a chapter's story run: none from the first form-B card into the note. */
  const f = new StoryRunner(seeded(13), wh, ['en'])
  f.index = f.steps.findIndex((s, k) => s.kind === 'beat' && f.chapterOf[k] === fin)
  record(
    T,
    'Back from the first finale card is not offered (it would cross the note)',
    f.backTarget === null,
  )
  /* The map: the current chapter's cards only. */
  const m = new StoryRunner(seeded(14), wh, ['en'])
  const c1 = m.chapterCards(1)
  m.index = m.steps.findIndex((s) => s.kind === 'saved')
  const c1done = m.chapterCards(1)
  m.index += 1
  const c2 = m.chapterCards()
  record(
    T,
    'the map counts the current chapter only: chapter 1 from none to all, then chapter 2 from none',
    c1.done === 0 &&
      c1done.done === c1.total &&
      c2.done === 0 &&
      c2.total > 0 &&
      m.chapterAt() === 2,
    `${JSON.stringify(c1)} ${JSON.stringify(c1done)} ${JSON.stringify(c2)}`,
  )
}

/** Back and edits (owner, 19 Oct 2026): the saved answer comes back, the final one is scored, the edit is counted. */
function backAndEdits() {
  const T = 'X-12 consequences follow the notes only'
  const wh = storyById('warehouse')
  if (!wh) return
  const r = new StoryRunner(seeded(7), wh, ['en'])
  let first = -1
  for (let g = 0; g < 200 && r.current; g++) {
    const s = r.current
    if (
      s.kind === 'beat' &&
      r.season.beats[s.i].kind === 'people' &&
      !r.season.beats[s.i].beat.mascot
    ) {
      const b = r.season.beats[s.i]
      if (b.kind === 'people' && b.beat.kind === 'rank') {
        first = s.i
        r.answer({ order: [0, 1, 2, 3] })
        break
      }
    }
    r.answer(
      s.kind === 'beat' && r.season.beats[s.i].kind === 'ordinary'
        ? { option: (r.season.beats[s.i] as { order: string[] }).order[0] }
        : s.kind === 'beat'
          ? (() => {
              const b = r.season.beats[s.i]
              return b.kind === 'people' && b.beat.kind === 'pick'
                ? { pick: 0 }
                : b.kind === 'people' && b.beat.kind === 'split'
                  ? { units: b.chars.map((_, k) => (k === 0 ? poolOf(b.beat) : 0)) }
                  : { order: b.kind === 'people' ? b.chars.map((_, k) => k) : [] }
            })()
          : null,
    )
  }
  r.back()
  const kept =
    r.current?.kind === 'beat' &&
    r.current.i === first &&
    JSON.stringify(r.answers.get(first)) === JSON.stringify({ order: [0, 1, 2, 3] })
  r.answer({ order: [3, 2, 1, 0] })
  record(
    T,
    'Back reopens a decision with its saved answer; the answer given last is the one scored, and the edit is counted',
    kept &&
      JSON.stringify(r.answers.get(first)) === JSON.stringify({ order: [3, 2, 1, 0] }) &&
      r.edits.get(first) === 1,
  )
  const v = colleagueView(r, r.cast[0], true)
  const tiles = castTiles(r, true, () => [], true)
  record(
    T,
    'after the reveal no face carries a mascot inset; the reveal alone shows each mascot beside its face',
    v.inset === undefined && tiles.every((t) => t.inset !== undefined),
  )
}

function consequences() {
  const T = 'X-12 consequences follow the notes only'
  const wh = storyById('warehouse')
  if (!wh) return
  /* A notes-only player (by tier, then by description id): the consequence templates and the
     season points must be the same in every seeded season, whatever cast and order it drew. */
  const play = (seed: number) => {
    const r = new StoryRunner(seeded(seed), wh, ['en'])
    const out: string[] = []
    r.season.beats.forEach((b, i) => {
      if (b.kind === 'people') {
        const rank = b.chars
          .map((c, pos) => ({ c, pos }))
          .sort((x, y) => y.c.tier - x.c.tier || x.c.d.localeCompare(y.c.d))
          .map((x) => x.pos)
        r.answers.set(
          i,
          b.beat.kind === 'rank'
            ? { order: rank }
            : b.beat.kind === 'pick'
              ? { pick: rank[0] }
              : { units: b.chars.map((_, pos) => (pos === rank[0] ? 4 : pos === rank[1] ? 2 : 0)) },
        )
      } else
        r.answers.set(i, {
          option: [...b.beat.options].sort((x, y) => x.id.localeCompare(y.id))[0].id,
        })
      const c = r.consequence(i)
      const names =
        b.kind === 'people' ? b.chars.map((ch) => r.displayName(ch.slot, r.revealed(i))) : []
      out.push(names.reduce((s, n) => s.split(n).join('{name}'), c?.text ?? ''))
    })
    return { out: out.join('\n'), points: r.points }
  }
  const ref = play(1)
  const diff: number[] = []
  for (let s = 2; s <= N; s++) {
    const p = play(s)
    if (p.out !== ref.out || p.points !== ref.points) diff.push(s)
  }
  record(
    T,
    `${N} seeded seasons, one notes-only player: the same consequences and season points whatever the cast`,
    diff.length === 0,
    diff.slice(0, 5).join(','),
  )
  const runner = readFileSync(`${ROOT}src/story/runner.ts`, 'utf8')
  record(
    T,
    'the consequence key is the lead\'s merit tier (or "even"), never a cue',
    /const key = lead === 'even' \? 'even' : String\(b\.chars\[lead\]\.tier\)/.test(runner) &&
      !/after\[[^\]]*(sex|religion|tone|caste|born|name)/.test(runner),
  )
}

function rating() {
  const T = 'X-13 the attitude rating on 57 cards (thresholds PENDING v18)'
  const alpha = 1 - config.season.rating.levels.moderate
  const domainZones: Record<string, Record<string, number>> = {}
  const casteZones: Record<string, Record<string, number>> = {}
  const zones = (t: typeof fairPlayer, name: string) => {
    const z: Record<string, number> = {}
    const dz: Record<string, number> = {}
    const cz: Record<string, number> = {}
    for (let s = 1; s <= N; s++) {
      const rt = rate(playSeason(1000 + s, t))
      const h = rt.headline
      const k = h.zone === 'lean' ? `lean:${h.towards}` : h.zone
      z[k] = (z[k] ?? 0) + 1
      for (const [d, x] of Object.entries(rt.domains)) {
        const kk = `${d}:${x.zone === 'lean' ? `lean:${x.towards}` : x.zone}`
        dz[kk] = (dz[kk] ?? 0) + 1
      }
      for (const o of rt.others) {
        const kk = `${o.cue}:${o.zone}`
        cz[kk] = (cz[kk] ?? 0) + 1
      }
    }
    domainZones[name] = dz
    casteZones[name] = cz
    return z
  }
  const fair = zones(fairPlayer, 'fair')
  const leaning = zones(leaningPlayer, 'lean')
  const careless = zones(carelessPlayer, 'careless')
  zones({ cueWeight: 0, casteWeight: 2, noise: 0.3, careless: false }, 'caste')
  const fairLean = ((fair['lean:focal'] ?? 0) + (fair['lean:comparison'] ?? 0)) / N
  record(
    T,
    `a notes-only player reads as a lean in about alpha of seasons or fewer (${(fairLean * 100).toFixed(1)}%, alpha ${(alpha * 100).toFixed(0)}%)`,
    fairLean <= 2 * alpha,
    JSON.stringify(fair),
  )
  record(
    T,
    `a player who strongly favours men reads "leans towards men" in most seasons (${(((leaning['lean:comparison'] ?? 0) / N) * 100).toFixed(0)}%) and never towards women`,
    (leaning['lean:comparison'] ?? 0) / N >= 0.8 && !leaning['lean:focal'],
    JSON.stringify(leaning),
  )
  record(
    T,
    'a content-blind player reads "not enough to say" in nearly every season (95% or more)',
    (careless.unread ?? 0) / N >= 0.95,
    JSON.stringify(careless),
  )
  const doms = ['hiring', 'conduct', 'resources']
  const dl = domainZones.lean
  const df = domainZones.fair
  record(
    T,
    `each domain panel produces a reading on its 19 cards: the strong lean towards men read in 80% or more per domain (${doms.map((d) => Math.round(((dl[`${d}:lean:comparison`] ?? 0) / N) * 100)).join(', ')}%), a notes-only player in 10% or fewer per domain, and an engaged player almost never "not enough to say"`,
    doms.every((d) => (dl[`${d}:lean:comparison`] ?? 0) / N >= 0.8) &&
      doms.every(
        (d) => ((df[`${d}:lean:focal`] ?? 0) + (df[`${d}:lean:comparison`] ?? 0)) / N <= 0.1,
      ) &&
      doms.every((d) => (df[`${d}:unread`] ?? 0) / N <= 0.05),
    JSON.stringify({ lean: dl, fair: df }),
  )
  const cz = casteZones
  record(
    T,
    `caste and birthplace now read on the one-offs: a player against surnames read as Scheduled Caste reads a caste lean in 80% or more (${Math.round(((cz.caste['caste:lean'] ?? 0) / N) * 100)}%), a notes-only player in 10% or fewer, birthplace likewise`,
    (cz.caste['caste:lean'] ?? 0) / N >= 0.8 &&
      (cz.fair['caste:lean'] ?? 0) / N <= 0.1 &&
      (cz.fair['birthplace:lean'] ?? 0) / N <= 0.1,
    JSON.stringify(cz),
  )
  const r = playSeason(5, leaningPlayer)
  const rt = rate(r)
  record(
    T,
    'decisive pairs come only from the 57 rating cards (after the reveal, before the note), and only from equal notes',
    rt.decisive.every((p) => r.isRating(p.beat)) &&
      rt.decisive.every((p) => {
        const b = r.season.beats[p.beat]
        return (
          b.kind === 'people' &&
          b.chars.find((c) => c.slot === p.a)?.tier === b.chars.find((c) => c.slot === p.b)?.tier
        )
      }),
  )
  const m = resultModel(r)
  record(
    T,
    'the result model gives the tag, the position with its range, what a pair is, the reasons with a named pair, and the share card (the tag only in what "Include my result" adds)',
    !!m.band &&
      !!m.range &&
      !!m.hero?.pair &&
      m.why.some((w) => /had equally strong descriptions/.test(w)) &&
      !m.share.includes(m.band) &&
      m.shareResult.includes(m.band),
  )
  const src =
    readFileSync(`${ROOT}src/story/why.ts`, 'utf8') +
    readFileSync(`${ROOT}src/screens/Story.tsx`, 'utf8')
  record(T, 'no result code writes "bias"', !/['"`][^'"`]*\bbias/i.test(src))
  const people = [...r.cast, ...r.season.extras]
  const caste = cueSets(people, 'caste')
  const birth = cueSets(people, 'birthplace')
  record(
    T,
    'caste compares only one-offs with surnames, birthplace only one-offs with a birthplace; sex, religion and tone only the cast',
    [...caste.pool].every((s) => !!r.person(s).caste && r.person(s).oneOff) &&
      [...birth.pool].every((s) => !!r.person(s).born && r.person(s).oneOff) &&
      [...cueSets(people, 'sex').pool].every((s) => !r.person(s).oneOff) &&
      weightOf(
        [{ beat: 0, a: [...caste.real][0], b: [...birth.pool][0], adv: 1 }],
        caste.real,
        caste.pool,
      ).n === 0,
  )
}

function records() {
  const T = 'X-14 season records'
  const r = playSeason(11, fairPlayer)
  const people = r.season.beats.filter((b) => b.kind === 'people').length
  const ordinary = r.season.beats.length - people
  return (async () => {
    await r.prepareCode(1000)
    const sub = r.submission()
    const cards = Object.values(sub.play.value.cards)
    const items = Object.values(sub.play.value.items)
    record(
      T,
      `80 counted decisions (${r.counted}), ${r.asked} asked: one card record per people decision (form B marked B), one item per ordinary decision, screening item, survey item in each administration, the recall, the probe and the three wrap items`,
      r.counted === 80 &&
        cards.length === people &&
        cards.filter((c) => c.form === 'B').length === 6 &&
        items.filter((i) => i.k === 'ord').length === ordinary &&
        items.filter((i) => i.k === 'screen').length === 4 &&
        items.filter((i) => i.k === 'survey' && i.a === 1).length === 4 &&
        items.filter((i) => i.k === 'survey' && i.a === 2).length === 4 &&
        items.filter((i) => i.k === 'recall').length === 1 &&
        items.filter((i) => i.k === 'probe').length === 1 &&
        items.filter((i) => i.k === 'prior').length === 3 &&
        sub.play.value.meta.split === 'low' &&
        (sub.play.value.meta.note === 'b' || sub.play.value.meta.note === 'c'),
    )
    record(
      T,
      'card records fit the database whitelist (dep season, positions 0 to 3, scores 0 to 1, the mascot beats as animal and baseline)',
      sub.play.value.meta.dep === 'season' &&
        cards.every(
          (c) =>
            c.card.length <= 20 &&
            c.chars.every((ch) => ch.st >= 0 && ch.st <= 3 && ch.s >= 0 && ch.s <= 1) &&
            (c.pres === 'animal') === c.base,
        ),
    )
    record(
      T,
      'no time, date or order field in any season record',
      timeFields(sub.play.value).length === 0,
      timeFields(sub.play.value).join(', '),
    )
    /* Back: answer, go back (the saved answer is shown again), answer differently: only the final
       answer is kept and scored, and the edit is counted (EVAL-6). */
    const wh = storyById('warehouse')
    if (!wh) return
    const b = new StoryRunner(seeded(3), wh, ['en'])
    b.answer(null)
    b.answer({ order: [0, 1, 2, 3] })
    b.back()
    const reopened = b.current?.kind === 'beat' && b.answers.size === 1
    b.answer({ order: [3, 2, 1, 0] })
    record(
      T,
      'Back reopens the last decision with its saved answer and keeps only the final answer, counting the edit',
      reopened &&
        b.answers.size === 1 &&
        JSON.stringify(b.answers.get(0)) === JSON.stringify({ order: [3, 2, 1, 0] }) &&
        b.edits.get(0) === 1,
    )
    const rules = readFileSync(`${ROOT}database.rules.json`, 'utf8')
    record(
      T,
      'the database rules accept the season deployment in every dep field',
      (rules.match(/newData\.val\(\) == 'season'/g) ?? []).length === 4,
    )
  })()
}

async function profile() {
  const T = 'X-15 the optional profile'
  const local = store as LocalStore
  const s1: ProfileSession = {
    story: 'warehouse',
    day: '2026-10-19',
    zone: 'lean',
    towards: 'comparison',
    weight: -0.7,
    pairs: 25,
    code: '',
  }
  /* A real season's records, so deletion can be checked. */
  const r = playSeason(21, fairPlayer)
  const [tok] = await store.issueTokens('season', 1, 'en')
  await store.start(tok)
  await r.prepareCode()
  await store.submit(r.keys?.code ?? '', 'season', r.submission())
  s1.code = r.code ?? ''
  const u = await createProfile('Asha', s1)
  const box = local.tree['eval-profile'][u.key] as Record<string, string>
  record(
    T,
    'the store holds only ciphertext: no display name, band or code in it',
    Object.keys(box).sort().join(',') === 'ct,iv' &&
      !JSON.stringify(box).includes('Asha') &&
      !JSON.stringify(box).includes(s1.code),
  )
  const again = await openProfile(u.code)
  record(
    T,
    'the recovery code opens it again; a wrong code opens nothing',
    again?.data.name === 'Asha' &&
      again.data.sessions.length === 1 &&
      (await openProfile('ABCDEFGHJKMN')) === null,
  )
  await openProfile(u.code)
  await addSession({
    ...s1,
    day: '2026-12-01',
    zone: 'none',
    towards: undefined,
    weight: 0,
    code: s1.code,
  })
  await setResearch(true)
  const long = local.tree['eval-long'][u.long] as { plays: string } | undefined
  record(
    T,
    "research opt-in writes only the saved seasons' play keys; opting out deletes them",
    !!long && /^[0-9a-f]{32}(,[0-9a-f]{32})*$/.test(long.plays) && Object.keys(long).length === 1,
  )
  await setResearch(false)
  record(T, 'opting out deletes the research link', local.tree['eval-long'][u.long] === undefined)
  const playKey = r.keys?.play ?? ''
  const had = local.tree['eval-play'][playKey] !== undefined
  const del = await deleteProfile()
  record(
    T,
    '"Delete my profile and all my records" removes the profile and withdraws its seasons',
    had &&
      local.tree['eval-play'][playKey] === undefined &&
      local.tree['eval-profile'][u.key] === undefined &&
      del.withdrawn >= 1,
  )
  const at = (w: number, m: number) => ({ ...s1, counts: { w, m, e: 0 } })
  const ch = changeOf([at(5, 20), at(18, 7)])
  const none = changeOf([at(5, 20), at(8, 17)])
  record(
    T,
    `a change is shown only when the faster change rule fires (|z| over ${config.season.profile.reliableChange}, config.season.profile, PENDING v26); otherwise "No change shown"`,
    ch?.towards === 'focal' && none === null && changeOf([at(5, 20)]) === null,
  )
  const gap = config.season.retakeGapDays
  record(
    T,
    'the next retake is a date or nothing, never a countdown',
    nextRetake([s1]) ===
      (gap === null ? null : Date.parse('2026-10-19T00:00:00+05:30') + gap * 86_400_000) &&
      !/countdown|seconds? left|minutes? left|hours? left|days? left/i.test(JSON.stringify(PF)),
  )
  const before = Object.keys(local.tree['eval-contact']).length
  await store.contactPut('k' + Date.now().toString(36), {
    nm: 'Test',
    em: 'test@example.test',
    follow: true,
    research: false,
  })
  const added = Object.values(local.tree['eval-contact']).slice(before) as Record<string, unknown>[]
  const rules = readFileSync(`${ROOT}database.rules.json`, 'utf8')
  record(
    T,
    'stay-in-touch details are stored apart, with only a name, an email and the two opt-ins, never readable through the rules',
    added.length === 1 &&
      Object.keys(added[0]).sort().join(',') === 'em,follow,nm,research' &&
      /"eval-contact"[\s\S]*?"\$other": \{ ".validate": false \}/.test(rules) &&
      !/"eval-contact": \{\s*"\$k": \{[^}]*".read"/.test(rules),
  )
}

/** The owner's prototype pass (EVAL-10): practice, the firm chapter flag, the help mode, one length, the profile's ranges. */
async function prototypePass() {
  const T = 'X-20 prototype pass (EVAL-10)'
  const wh = storyById('warehouse')
  if (!wh) return
  const answerAll = (r: StoryRunner, choice: 'practice' | 'start', days?: string[]) => {
    let k = 0
    for (let g = 0; g < 500 && r.current && r.current.kind !== 'close'; g++) {
      const st = r.current
      if (days) r.clock = () => days[Math.min(days.length - 1, r.chapterAt() - 1)]
      if (st.kind === 'intro') r.answer(choice)
      else if (st.kind === 'practice') {
        k += 1
        r.answer(null)
      } else if (st.kind === 'beat') {
        const b = r.season.beats[st.i]
        r.answer(
          b.kind === 'ordinary'
            ? { option: b.order[0] }
            : b.beat.kind === 'rank'
              ? { order: b.chars.map((_, i) => i) }
              : b.beat.kind === 'pick'
                ? { pick: 0 }
                : (() => {
                    const pool = poolOf(b.beat)
                    const first = Math.ceil(pool / 2)
                    return {
                      units: b.chars.map((_, i) => (i === 0 ? first : i === 1 ? pool - first : 0)),
                    }
                  })(),
        )
      } else if (st.kind === 'fsurvey') r.answer({})
      else if (st.kind === 'screening') r.answer({})
      else if (st.kind === 'recall') r.answer(r.note)
      else if (st.kind === 'probe') r.answer(['sex'])
      else if (st.kind === 'wrap') r.answer({ told: 'no', origin: 'chose', replay: 'no' })
      else if (st.kind === 'demographics') r.answer({})
      else r.answer(null)
    }
    return k
  }
  /* Practice: offered once, three items (rank, share, pick), skipped unless chosen, never
     recorded; the record says only whether it was taken. */
  const a = new StoryRunner(seeded(31), wh, ['en'])
  const b = new StoryRunner(seeded(31), wh, ['en'])
  const tookA = answerAll(a, 'practice')
  const tookB = answerAll(b, 'start')
  await a.prepareCode(1000)
  await b.prepareCode(1000)
  const sa = a.submission()
  const sb = b.submission()
  const strip = (x: typeof sa) =>
    JSON.stringify({
      cards: Object.values(x.play.value.cards)
        .map((c) => c.card)
        .sort(),
      items: Object.values(x.play.value.items)
        .map((i) => `${i.k}:${i.i}`)
        .sort(),
    })
  record(
    T,
    'practice is three items (rank, share, pick) after the opening, played only when chosen, never recorded or scored; the record carries practice y or n only',
    tookA === 3 &&
      tookB === 0 &&
      sa.play.value.meta.practice === 'y' &&
      sb.play.value.meta.practice === 'n' &&
      strip(sa) === strip(sb) &&
      a.points === b.points,
    `${tookA} ${tookB} ${sa.play.value.meta.practice} ${sb.play.value.meta.practice}`,
  )
  /* The firm per-chapter flag: one letter per chapter and the finale, y when played after the
     player's own training date, n when not (before it or on the day); none without a date. */
  const f = new StoryRunner(seeded(32), wh, ['en'])
  f.training = '2027-01-10'
  answerAll(f, 'start', [
    '2027-01-05',
    '2027-01-08',
    '2027-01-10',
    '2027-01-12',
    '2027-01-15',
    '2027-01-16',
  ])
  await f.prepareCode(1000)
  const fm = f.submission().play.value.meta
  const flat = JSON.stringify(f.submission().play.value)
  record(
    T,
    'meta.chapter_timing records, per chapter then the finale, after the training date or not (y or n), never a date or a time; a panel season has none',
    fm.chapter_timing === 'nnnyyy' &&
      !flat.includes('2027-01') &&
      sb.play.value.meta.chapter_timing === undefined,
    String(fm.chapter_timing),
  )
  /* "English with Hinglish help": English on screen, the Hinglish under each question and
     description; the record says both. */
  const h = new StoryRunner(seeded(33), wh, ['en', 'hinglish'])
  const e = new StoryRunner(seeded(33), wh, ['en'])
  record(
    T,
    '"Both, mixed" is real: English with the Hinglish under each question and description (help mode), recorded as both',
    h.help && !e.help && h.lang === 'en',
  )
  /* One true session length: every screen that names one fills it from sessionMinutes. */
  const minutes = sessionMinutes(wh)
  const lengthy = JSON.stringify(storyContent.screens).match(/\d+ minute/g) ?? []
  record(
    T,
    `one session length (${minutes} minutes) filled from the estimate everywhere; no fixed minute count in season copy`,
    minutes % 5 === 0 &&
      minutes * 60 >= new StoryRunner(seeded(1), wh, ['en']).estimateSeconds() &&
      lengthy.length === 0 &&
      /\{minutes\}/.test(SS.pickBody.en) &&
      SS.startPoints.some(
        (p) => /\{minutes\}/.test(p.text.en) && /\{minutes\}/.test(p.text.hinglish),
      ),
    lengthy.join(', '),
  )
  /* The scoring rule: nothing shown during the game says how answers are read. */
  const inGame = JSON.stringify([wh.intro, wh.episodes, SS.pickBody, SS.startPoints, PRACTICE])
  record(
    T,
    'no in-game copy says how answers are read ("reads you", "decisions that count", "attitude", "rating", "equal pairs", "chance")',
    !/reads you|padhti hai|that count|gine jaate|attitude|rating|equal pairs|chance|ittefaq/i.test(
      inGame,
    ),
    (
      inGame.match(
        /reads you|padhti hai|that count|gine jaate|attitude|rating|equal pairs|chance|ittefaq/gi,
      ) ?? []
    ).join(', '),
  )
  /* The comic page (EVAL-10): every panel caption is 25 words or fewer in English (30 in
     Hinglish): scenes, consequences, chapter openings, payoff panels, practice scenes. */
  const caps = [
    ...(wh.beats ?? []).flatMap((x) => [
      x.scene,
      ...Object.values('after' in x ? (x.after ?? {}) : {}),
    ]),
    ...(wh.episodes ?? []).flatMap((e) => [e.opening, ...e.payoff.map((p) => p.text)]),
    ...PRACTICE.items.map((it) => it.scene),
  ].filter(Boolean) as { en: string; hinglish: string }[]
  const long = caps.filter(
    (c) => c.en.split(/\s+/).length > 25 || c.hinglish.split(/\s+/).length > 30,
  )
  record(
    T,
    `every comic-page caption is 25 words or fewer (${caps.length} captions: scenes, consequences, chapter openings, payoffs, practice)`,
    long.length === 0,
    long.map((c) => c.en).join(' | '),
  )
  const beatSrc = readFileSync(`${ROOT}src/ui/Beat.tsx`, 'utf8')
  record(
    T,
    'a decision page is a comic page: panel 1 (what happened, or the chapter title panel), panel 2 (a drawn prop beside the scene), panel 3 (the question in a caption box); props are inline SVG from the art kit, never a generated face',
    /beat__title/.test(beatSrc) &&
      /<Then/.test(beatSrc) &&
      /<PanelArt/.test(beatSrc) &&
      /beat__ask/.test(beatSrc) &&
      !/<img|<Portrait/.test(beatSrc),
  )
  /* The always-show rule (owner, EVAL-10; v26 registers it) and the research critic's
     adjustment: a forming reading is never a dead end (the range, said in words, the next step,
     "Tagged after N more seasons on your profile" or "not available yet", no tag, a hollow or
     no point, all from config); the other readings always show; the areas only once readable;
     no line of the forming copy is over 25 words, says "cannot" or blames. */
  const below = sectionsBelow(true, ['unread', 'unread'])
  const read = sectionsBelow(false, ['unread', 'unread'])
  let seasonsOk = true
  let forming = 0
  for (let k = 1; k <= 30; k++) {
    const mm = resultModel(playSeason(k, carelessPlayer))
    if (!mm.unread) continue
    forming += 1
    if (!mm.range || !mm.forming || !/^Somewhere between|^Around/.test(mm.forming.words))
      seasonsOk = false
    if (mm.sections.areas || !mm.sections.others) seasonsOk = false
  }
  const lines = Object.entries(RT.forming)
    .filter(([key]) => !key.startsWith('_'))
    .flatMap(([, t]) => [t.en, t.hinglish])
  const u = config.season.rating.untagged
  record(
    T,
    `a forming reading is never a dead end: the range in words, the next step, the seasons-to-tag line from config.season.profile (women and men open at ${config.season.profile.readings[0].opens}), a ${u.point} point, the other readings always, the areas only once readable; forming copy 25 words or fewer per line, no "cannot" (${forming} of 30 careless seasons were forming)`,
    below.others &&
      !below.areas &&
      read.others &&
      read.areas &&
      seasonsOk &&
      forming > 0 &&
      ['hollow', 'none'].includes(u.point) &&
      lines.every((l) => l.split(/\s+/).length <= 25 && !/cannot|can't|nahin de sakte/i.test(l)),
  )
  /* Ranges: inside 0 to 1 around the position, narrower with more pairs; the profile shows a
     change only when two seasons' ranges do not overlap. */
  const small = positionOf({ w: 3, m: 7, e: 0 })
  const big = positionOf({ w: 30, m: 70, e: 0 })
  record(
    T,
    `the position sits inside its range and the range narrows with more pairs (${config.season.rating.range.method}, mass ${config.season.rating.range.mass}, from config)`,
    !!small &&
      !!big &&
      small.lo <= small.at &&
      small.at <= small.hi &&
      big.hi - big.lo < small.hi - small.lo,
  )
}

/**
 * The profile built (EVAL-12): readings pooled since the last restart (equal weights by default,
 * inverse variance as the config's other value), the faster change rule and the restart after the
 * season that fires it, each reading tagged only at its registered count with "Tagged after N
 * more seasons" never projected per player, the optional email kept apart and deletable, and the
 * demo profile showing a confirmed reading, an unconfirmed one, a restart and the trend.
 */
async function profilePooling() {
  const T = 'X-21 the profile: pooling, change and restart (EVAL-12)'
  const P = config.season.profile
  const a = estimateOf({ w: 8, m: 16, e: 1 })
  const b = estimateOf({ w: 10, m: 14, e: 0 })
  const eq = a && b ? pool([a, b], 'equal') : null
  const iv = a && b ? pool([a, b], 'inverse-variance') : null
  record(
    T,
    `seasons pool with ${P.pooling} weights (config): equal weights average the estimates with the variances summed over k squared; inverse variance is the other option; pooling narrows the range`,
    !!a &&
      !!b &&
      !!eq &&
      !!iv &&
      Math.abs(eq.at - (a.at + b.at) / 2) < 1e-12 &&
      Math.abs(eq.v - (a.v + b.v) / 4) < 1e-12 &&
      Math.abs(iv.v - 1 / (1 / a.v + 1 / b.v)) < 1e-12 &&
      rangeOf(eq).hi - rangeOf(eq).lo < rangeOf(a).hi - rangeOf(a).lo,
  )
  const season = (w: number, m: number): ProfileSession => ({
    story: 'x',
    day: '2026-01-01',
    zone: 'none',
    weight: 0,
    pairs: w + m,
    counts: { w, m, e: 0 },
    readings: { sex: { w, m, e: 0 }, tone: { w: 12, m: 12, e: 0 } },
    code: '',
  })
  const w4 = walk([season(5, 20), season(18, 7), season(12, 13), season(11, 14)])
  const w2 = walk([season(5, 20), season(18, 7)])
  const steady = walk([season(5, 20), season(7, 18), season(6, 19)])
  record(
    T,
    'the faster change rule restarts the pool after the season that fires it: that season is the change, not pooled, and the pool starts on the next season; steady seasons all pool',
    JSON.stringify(w4.changes) === '[1]' &&
      JSON.stringify(w4.pooled) === '[2,3]' &&
      !w4.latestChanged &&
      w4.trend[1].change &&
      w4.trend[3].pooled === 2 &&
      w2.latestChanged &&
      w2.pooled.length === 0 &&
      steady.changes.length === 0 &&
      steady.pooled.length === 3,
  )
  const lean = profileNow([season(5, 20), season(6, 19)])
  const even = profileNow([season(12, 12), season(13, 11)])
  const r = (x: typeof lean, id: string) => x.readings.find((y) => y.id === id)
  const sameN = P.readings.every((rd) => r(lean, rd.id)?.toTag === r(even, rd.id)?.toTag)
  record(
    T,
    `each reading is tagged only once the seasons pooled since the restart reach its registered count (${P.readings.map((x) => `${x.id} ${x.opens ?? 'none'}`).join(', ')}); N is that count less the seasons pooled, the same for every player; a reading with no count says "not available yet"`,
    r(lean, 'sex')?.tagged === (P.readings[0].opens !== null && P.readings[0].opens <= 2) &&
      P.readings.every((rd) => {
        const x = r(lean, rd.id)
        if (!x) return false
        if (rd.opens === null) return x.toTag === null && !x.tagged
        return (
          x.toTag === Math.max(0, rd.opens - x.seasons) && (x.tagged ? x.seasons >= rd.opens : true)
        )
      }) &&
      sameN &&
      r(lean, 'religion')?.seasons === 0,
  )
  await seedDemoProfile()
  const demo = await openProfile(DEMO_PROFILE_CODE)
  const ds = demo?.data.sessions ?? []
  const now = profileNow(ds)
  const tagged = now.readings.filter((x) => x.tagged).length
  const forming = now.readings.filter((x) => !x.tagged && (x.toTag ?? 0) > 0).length
  record(
    T,
    `the demo profile holds 4 past seasons across 3 stories with a restart, ${tagged} confirmed and ${forming} unconfirmed readings, and a trend point per season`,
    ds.length === 4 &&
      storiesPlayed(ds).played === 3 &&
      now.changes.length === 1 &&
      tagged >= 1 &&
      forming >= 1 &&
      now.trend.length === 4 &&
      !!demo?.data.demo,
  )
  const local = store as LocalStore
  await setContact('owner@example.test', true, false)
  const key = demo?.data.contact?.key ?? ''
  const first = JSON.stringify(local.tree['eval-contact'][key])
  await setContact('owner2@example.test', false, true)
  const second = local.tree['eval-contact'][key] as Record<string, unknown> | undefined
  await setContact('', false, false)
  const removed = local.tree['eval-contact'][key] === undefined && !demo?.data.contact
  await setContact('owner@example.test', true, true)
  const again = demo?.data.contact?.key ?? ''
  await deleteProfile()
  record(
    T,
    "the profile's email is kept apart at a random key with only the email and the two opt-ins, replaced on change, removed when emptied, and deleted with the profile",
    /owner@example.test/.test(first) &&
      second?.em === 'owner2@example.test' &&
      Object.keys(second ?? {})
        .sort()
        .join(',') === 'em,follow,research' &&
      removed &&
      local.tree['eval-contact'][again] === undefined &&
      !JSON.stringify(local.tree['eval-profile']).includes('owner@'),
  )
}
