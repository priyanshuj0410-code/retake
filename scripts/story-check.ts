/**
 * The season story (EVAL-4): its content, its draws, that consequences follow the notes only,
 * the attitude rating, its records, and the optional profile. Registered in scripts/check-all.ts.
 */
import { readFileSync } from 'node:fs'
import { identity, surveyItems } from '../src/content'
import { config } from '../src/engine/config'
import { seeded } from '../src/engine/rng'
import { fill } from '../src/engine/text'
import { isPeople, PF, RT, stories, storyContent, storyById } from '../src/story/content'
import { carelessPlayer, fairPlayer, leaningPlayer, playSeason } from '../src/story/players'
import {
  addSession,
  changeOf,
  createProfile,
  deleteProfile,
  nextRetake,
  openProfile,
  setResearch,
  type ProfileSession,
} from '../src/story/profile'
import { labellings, rate, weightOf } from '../src/story/rating'
import { StoryRunner } from '../src/story/runner'
import { drawCast } from '../src/story/session'
import { resultModel } from '../src/story/why'
import { store } from '../src/store'
import type { LocalStore } from '../src/store/local'
import { timeFields } from './no-timers'
import { record } from './lib/check'

const ROOT = new URL('..', import.meta.url).pathname
const N = Number(process.env.STORY_N ?? 200)

export async function run() {
  content()
  draws()
  consequences()
  rating()
  await records()
  await profile()
}

function content() {
  const T = 'X-10 season story: content'
  const wh = storyById('warehouse')
  const beats = wh?.beats ?? []
  record(
    T,
    'three seasons offered, the warehouse built, the newsroom and the clinic stubbed',
    stories.length === 3 &&
      !!wh?.built &&
      stories.filter((s) => !s.built).every((s) => /PENDING v17/.test(s.premise.en)),
  )
  record(T, `about 50 decisions (${beats.length})`, beats.length >= 40 && beats.length <= 56)
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
      return tiers === '1133' && keys === '1,3' && (b.shape === 'mixed' || b.shape === 'same')
    if (b.kind === 'pick' && b.shape === 'clear') return tiers === '13' && keys === '1,3'
    if (b.kind === 'pick')
      return tiers === '22' && keys === '2' && (b.shape === 'rival' || b.shape === 'same')
    return (
      tiers === '133' && keys === '1,3,even' && b.shape === 'rival' && (b.pool ?? 0) > 0 && !!b.unit
    )
  })
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
    'the content is marked PENDING v17, and every pendingV17 key exists in config.season',
    storyContent.status === 'PENDING v17' &&
      config.season.pendingV17.every(
        (k) =>
          k
            .split('.')
            .reduce<unknown>((o, p) => (o as Record<string, unknown>)?.[p], config.season) !==
          undefined,
      ),
  )
  const bands = Object.values(RT.bands).map((b) => b.name.en)
  record(
    T,
    'no band is named unbiased; the no-lean band reads as an absence of evidence',
    bands.every((b) => !/unbiased|fair/i.test(b)) &&
      RT.bands.none.name.en === 'No lean read in your decisions' &&
      /absence of evidence/.test(RT.bands.none.body.en),
  )
  const card = (band: string) =>
    fill(RT.shareCard.en, {
      title: 'The warehouse',
      decisions: 48,
      episodes: 5,
      cast: 8,
      band: fill(band, { group: 'men' }),
    })
  record(
    T,
    'the share card fills for every band, invites a comparison, and shows no score',
    bands.every((b) => !/\{/.test(card(b))) &&
      /Take it and compare/.test(RT.shareCard.en) &&
      !/\d+ ?(per cent|%)|score|rank/i.test(RT.shareCard.en.replace(/\{\w+\}/g, '')),
  )
  const doms = Object.values(RT.domains)
  record(
    T,
    "the result page has the owner's areas (hiring and promotion, complaints and conduct, sharing resources), each with 3 or 4 reflection prompts and 3 or 4 habits (sources PENDING v17, no effect claimed), and the Internal Committee line",
    doms.length === 3 &&
      doms.every(
        (d) =>
          d.origin.length >= 3 &&
          d.origin.length <= 4 &&
          d.watch.length >= 3 &&
          d.watch.length <= 4,
      ) &&
      /PENDING v17/.test(RT.watchBody.en) &&
      /no effect is claimed/.test(RT.watchBody.en) &&
      /Internal Committee/.test(RT.committee.en),
  )
  const eps = wh?.episodes ?? []
  const perEp = eps.map((_, k) => beats.filter((b) => b.episode === k + 1).length)
  record(
    T,
    `4 or 5 episodes with a title card each, about 10 to 12 decisions each (PENDING v17: ${perEp.join(', ')})`,
    eps.length >= 4 &&
      eps.length <= 5 &&
      eps.length === config.season.episodes &&
      perEp.every((x) => x >= 8 && x <= 12) &&
      eps.every((e) => !!e.title.en && !!e.premise.en),
  )
  record(
    T,
    'the complaint episode says sexual harassment goes to the Internal Committee, not a team lead',
    eps.some((e) => /Internal Committee/.test(e.premise.en)),
  )
  record(
    T,
    'reading levels use neutral colour tokens, never green or red',
    !/teal|coral|green|red\b|--c-ok|--c-error/.test(
      readFileSync(`${ROOT}src/ui/readinggrid.css`, 'utf8') +
        readFileSync(`${ROOT}src/ui/pointcard.css`, 'utf8'),
    ),
  )
  record(
    T,
    'no "how accurate was this?" self-rating on the result page',
    !/accurate|accuracy/i.test(JSON.stringify(storyContent.rating)),
  )
  const story = readFileSync(`${ROOT}src/screens/Story.tsx`, 'utf8')
  const order = [
    'RT.opening',
    'RT.readingsTitle',
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
    "the result page renders its sections in the owner's order",
    at.every((x, i) => x > 0 && (i === 0 || x > at[i - 1])),
    at.join(','),
  )
  record(
    T,
    'the profile offers a separate research consent marked PENDING v17, the delete-everything action, and "No change read yet"',
    /PENDING v17/.test(PF.researchTitle.en) &&
      PF.researchConsent.some((c) => /PENDING v17/.test(c.en)) &&
      PF.deleteButton.en === 'Delete my profile and all my records' &&
      PF.noChange.en === 'No change read yet.',
  )
  const est = (() => {
    const tm = config.season.timing
    const kinds = beats.map((b) => (isPeople(b) ? b.kind : 'ordinary'))
    const play =
      kinds.reduce((s, k) => s + (tm[k] ?? 0), 0) +
      tm.intro +
      tm['pick-season'] +
      tm.reveal +
      tm.episode * (wh?.episodes?.length ?? 0) +
      tm.season
    return {
      play,
      wrap:
        surveyItems.length * tm.surveyItem +
        2 * tm.priorItem +
        tm.debrief +
        tm.code +
        tm.demographics +
        tm.submit,
    }
  })()
  record(
    T,
    `the story plays in about 12 minutes at the planning timings, PENDING v17 (${(est.play / 60).toFixed(1)} min, wrap ${(est.wrap / 60).toFixed(1)} min)`,
    est.play / 60 >= 9 && est.play / 60 <= 15,
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
      if (!hindu.every((c) => c.surname && !c.born) || !muslim.every((c) => c.born && !c.surname))
        bad.push(`${s}: surname or birthplace`)
      if (
        new Set(hindu.map((c) => c.caste)).size !== 2 ||
        new Set(muslim.map((c) => c.born?.region)).size !== 2
      )
        bad.push(`${s}: caste or region pair`)
    }
    if (!cast.every((c) => cast[c.rival].sex !== c.sex && cast[c.rival].rival === c.slot))
      bad.push(`${s}: rivals`)
    const pairCount = new Map<string, number>()
    for (const b of r.season.beats) {
      if (b.kind !== 'people') continue
      const tied = (t: number) => b.chars.filter((c) => c.tier === t).map((c) => cast[c.slot])
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
    `${N} seeded seasons: 4 women and 4 men, 8 different animals and mascots, religion and tone balanced within sex, surname or birthplace never both, rival pairs of a woman and a man`,
    bad.filter((b) => !/tie|rival pairs/.test(b)).length === 0,
    bad.slice(0, 4).join(' | '),
  )
  record(
    T,
    'tied notes always go to the tied colleagues (rival pairs on mixed ranks, rival picks and splits; same sex on same-shape beats), and after the reveal the four rival pairs meet equally often (within one) in ranks and in picks',
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
  const T = 'X-13 the attitude rating (thresholds PENDING v17)'
  const alpha = 1 - config.season.rating.q
  const zones = (t: typeof fairPlayer) => {
    const z: Record<string, number> = {}
    for (let s = 1; s <= N; s++) {
      const h = rate(playSeason(1000 + s, t)).headline
      const k = h.zone === 'lean' ? `lean:${h.towards}` : h.zone
      z[k] = (z[k] ?? 0) + 1
    }
    return z
  }
  const fair = zones(fairPlayer)
  const leaning = zones(leaningPlayer)
  const careless = zones(carelessPlayer)
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
  const r = playSeason(5, leaningPlayer)
  const rt = rate(r)
  record(
    T,
    'decisive pairs come only from after the reveal, and only from equal notes',
    rt.decisive.every((p) => r.revealed(p.beat)) &&
      rt.decisive.every((p) => {
        const b = r.season.beats[p.beat]
        return (
          b.kind === 'people' &&
          b.chars.find((c) => c.slot === p.a)?.tier === b.chars.find((c) => c.slot === p.b)?.tier
        )
      }),
  )
  record(
    T,
    'caste and birthplace (one pair per sex) can never reach a reading, so they always say "not enough to say"',
    rt.others
      .filter((o) => o.cue === 'caste' || o.cue === 'birthplace')
      .every((o) => o.zone === 'unread' && o.labellings === 4),
  )
  const m = resultModel(r)
  record(
    T,
    'the result model gives the band, the bar, the reasons with a named pair, and the share card',
    !!m.band &&
      !!m.bar &&
      m.why.some((w) => /had the same record/.test(w)) &&
      m.share.includes(m.band),
  )
  const src =
    readFileSync(`${ROOT}src/story/why.ts`, 'utf8') +
    readFileSync(`${ROOT}src/screens/Story.tsx`, 'utf8')
  record(T, 'no result code writes "bias"', !/['"`][^'"`]*\bbias/i.test(src))
  const caste = labellings(r.cast, 'caste')
  const birth = labellings(r.cast, 'birthplace')
  record(
    T,
    'caste compares only colleagues with surnames, birthplace only colleagues with a birthplace',
    [...caste.pool].every((s) => !!r.cast[s].caste) &&
      caste.pool.size === 4 &&
      [...birth.pool].every((s) => !!r.cast[s].born) &&
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
      'one card record per people decision, one item per ordinary decision, survey item and wrap question',
      cards.length === people &&
        items.filter((i) => i.k === 'ord').length === ordinary &&
        items.filter((i) => i.k === 'survey').length === surveyItems.length &&
        items.filter((i) => i.k === 'prior').length === 2,
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
    /* Back: answer, go back, answer differently: only the final answer is kept. */
    const wh = storyById('warehouse')
    if (!wh) return
    const b = new StoryRunner(seeded(3), wh, ['en'])
    b.answer(null)
    b.answer({ order: [0, 1, 2, 3] })
    b.back()
    const reopened = b.current?.kind === 'beat' && b.answers.size === 0
    b.answer({ order: [3, 2, 1, 0] })
    record(
      T,
      'Back reopens the last decision and keeps only the final answer',
      reopened &&
        b.answers.size === 1 &&
        JSON.stringify(b.answers.get(0)) === JSON.stringify({ order: [3, 2, 1, 0] }),
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
  const ch = changeOf([s1, { ...s1, zone: 'none', weight: 0 }])
  const none = changeOf([s1, { ...s1, weight: -0.5 }])
  record(
    T,
    `a change is read only past the planning threshold (PENDING v17, ${config.season.change.minDiff}); otherwise "No change read yet"`,
    ch?.towards === 'focal' && none === null && changeOf([s1]) === null,
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
