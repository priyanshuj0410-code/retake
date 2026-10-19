/**
 * The game rules of tool design v3 and candidates v12 3.0 that the acceptance tests do not
 * already cover: people decisions are never scored; the season is decided by ordinary
 * decisions, some of them unscored too; one act order (cards, then the Committee Inbox, then
 * the direct items); out-of-fiction screens flagged; the content note before the Inbox.
 */
import { DEPLOYMENTS, type DeploymentId } from '../src/engine/config'
import { seeded } from '../src/engine/rng'
import { Runner } from '../src/engine/runner'
import { isOutOfFiction, type Step } from '../src/engine/session'
import { record } from './lib/check'

const T = 'X-3 game rules'

function play(seed: number, dep: DeploymentId, people: 'start' | 'reverse' | 'lavish-women') {
  const r = new Runner(seeded(seed), dep, ['en'])
  let guard = 0
  while (!r.done && guard++ < 1000) {
    const s = r.current as Step
    if (s.kind === 'people') {
      if (s.p.card.type === 'allocation') {
        const pool = s.p.card.pool ?? 0
        const w = s.p.chars.findIndex((c) => c.sex === 'woman')
        const units = [0, 0, 0, 0]
        units[people === 'lavish-women' && w >= 0 ? w : people === 'reverse' ? 3 : 0] = pool
        r.answer({ units })
      } else r.answer({ order: people === 'reverse' ? s.p.start.slice().reverse() : s.p.start })
    } else if (s.kind === 'ordinary') r.answer(s.d.options[0].id)
    else if (s.kind === 'screening') r.answer('2')
    else if (s.kind === 'survey') r.answer(2)
    else if (s.kind === 'inbox') r.answer({ label: 2, action: 'note' })
    else if (s.kind === 'xw') r.answer('same')
    else if (s.kind === 'probe') r.answer(['nothing'])
    else if (s.kind === 'submit') r.index += 1
    else r.answer(true)
  }
  return r
}

export async function run() {
  let unscoredOk = true
  let orderOk = true
  let oofOk = true
  let whyOrder = ''
  let seenUnscored = 0
  for (let i = 0; i < 60; i++) {
    for (const dep of DEPLOYMENTS) {
      const a = play(i, dep, 'start')
      const b = play(i, dep, 'reverse')
      const c = play(i, dep, 'lavish-women')
      if (a.points !== b.points || a.points !== c.points) unscoredOk = false
      seenUnscored += a.steps.filter((s) => s.kind === 'ordinary' && !s.d.scored).length
      const idx = (f: (s: Step) => boolean) => a.steps.findIndex(f)
      const last = (f: (s: Step) => boolean) =>
        a.steps.length - 1 - a.steps.slice().reverse().findIndex(f)
      const lastA = last((s) => s.kind === 'people' && s.p.form === 'A')
      const firstInbox = idx((s) => s.kind === 'inbox')
      const firstScreen = idx((s) => s.kind === 'screening')
      const note = idx((s) => s.kind === 'note')
      const firstB = idx((s) => s.kind === 'people' && s.p.form === 'B')
      const direct = idx((s) => s.kind === 'survey' && s.admin === 'direct')
      const probe = idx((s) => s.kind === 'probe')
      const lastCard = last((s) => s.kind === 'people')
      const contentNote = idx((s) => s.kind === 'intro' && s.which === 'inbox')
      const checks: [boolean, string][] = [
        [firstScreen < 0 || firstScreen > lastA, 'screening after the form-A cards'],
        [firstInbox < 0 || firstInbox > lastA, 'Inbox after the form-A cards'],
        [
          firstInbox < 0 || firstScreen < 0 || firstInbox > firstScreen,
          'Inbox after the screening block',
        ],
        [note < 0 || firstInbox < 0 || note > firstInbox, 'note after the Inbox'],
        [firstB < 0 || firstB > note, 'form B after the note'],
        [
          direct < 0 || (direct > lastCard && (firstInbox < 0 || direct > firstInbox)),
          'direct items after the cards and the Inbox',
        ],
        [probe > lastCard, 'the noticing probe after the last card'],
        [
          firstInbox < 0 || contentNote === firstInbox - 1,
          'the content note just before the Inbox',
        ],
      ]
      for (const [ok, what] of checks)
        if (!ok) {
          orderOk = false
          whyOrder ||= `${dep} seed ${i}: ${what}`
        }
      for (const s of a.steps) {
        const want = [
          'screening',
          'survey',
          'xw',
          'xw-direct',
          'm1h-direct',
          'note',
          'recall',
          'probe',
          'prior',
          'debrief',
          'code',
          'demographics',
          'submit',
        ].includes(s.kind)
        if (want && !isOutOfFiction(s)) oofOk = false
        if (
          (s.kind === 'people' || s.kind === 'ordinary' || s.kind === 'inbox') &&
          isOutOfFiction(s)
        )
          oofOk = false
      }
    }
  }
  record(
    T,
    'people decisions are never scored: any people answers give the same season result',
    unscoredOk,
  )
  record(
    T,
    'unscored ordinary decisions appear in sessions, so "unscored" never marks a measured card',
    seenUnscored > 0,
    `${seenUnscored} met`,
  )
  record(
    T,
    'one act order: cards, screening, Inbox, note, rounds after the note, direct items, wrap',
    orderOk,
    whyOrder,
  )
  record(T, 'out-of-fiction screens are flagged and game screens are not', oofOk)
}
