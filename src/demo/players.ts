/**
 * The seeded demo-player generator. DEMO ONLY: fictional players with a made-up decision
 * model, so the prototype can show its records, its release suppression and its checks
 * before any real participant exists. Nothing here is a finding.
 *
 * Each demo player drives the same Runner a person drives, so its records are exactly the
 * shape a person's would be. Decisions follow a random-utility model: each description has a
 * latent merit (a fixed hash of its id), each player a merit weight, a cue weight against
 * woman-cued characters, rank noise and a small chance of sorting content-blind.
 */
import { inboxBank } from '../content'
import type { Lang } from '../content/types'
import type { DeploymentId } from '../engine/config'
import type { Presented } from '../engine/layout'
import { seeded, type Rng } from '../engine/rng'
import { Runner, type FirmLabels } from '../engine/runner'

export const latentMerit = (id: string) => {
  let h = 2166136261
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return ((h >>> 0) % 1000) / 1000
}

export interface DemoTraits {
  meritWeight: number
  cueWeight: number
  noise: number
  careless: boolean
  fairness: number
}

const gauss = (rng: Rng) => Math.sqrt(-2 * Math.log(1 - rng.next())) * Math.cos(2 * Math.PI * rng.next())

export function traits(rng: Rng): DemoTraits {
  return {
    meritWeight: Math.max(0, 1 + 0.3 * gauss(rng)),
    cueWeight: 0.12 + 0.2 * gauss(rng),
    noise: 0.25 + 0.1 * rng.next(),
    careless: rng.next() < 0.05,
    fairness: Math.min(1, Math.max(0, 0.65 + 0.2 * gauss(rng))),
  }
}

function utilities(rng: Rng, p: Presented, t: DemoTraits): number[] {
  return p.chars.map((c) => {
    const merit = latentMerit(c.d)
    const cue = c.sex === 'woman' ? -t.cueWeight : 0
    return t.meritWeight * merit + cue + t.noise * gauss(rng)
  })
}

function decideCard(rng: Rng, p: Presented, t: DemoTraits) {
  if (t.careless) {
    if (p.card.type === 'allocation') {
      const pool = p.card.pool ?? 10
      const units = [0, 0, 0, 0]
      for (let i = 0; i < pool; i++) units[rng.int(4)] += 1
      return { units }
    }
    return { order: p.start.slice() }
  }
  const u = utilities(rng, p, t)
  if (p.card.type === 'allocation') {
    const pool = p.card.pool ?? 10
    const w = u.map((x) => Math.exp(3 * x))
    const total = w.reduce((a, b) => a + b, 0)
    const units = w.map((x) => Math.floor((pool * x) / total))
    let left = pool - units.reduce((a, b) => a + b, 0)
    const byU = [0, 1, 2, 3].sort((a, b) => u[b] - u[a])
    for (let i = 0; left > 0; i = (i + 1) % 4, left--) units[byU[i]] += 1
    return { units }
  }
  return { order: [0, 1, 2, 3].sort((a, b) => u[b] - u[a]) }
}

const scaleAnswer = (rng: Rng, fair: number, keying: 'agree-fair' | 'disagree-fair', points = 5) => {
  const x = Math.min(1, Math.max(0, fair + 0.2 * gauss(rng)))
  const pos = Math.round(x * (points - 1))
  return keying === 'agree-fair' ? pos : points - 1 - pos
}

export interface DemoPlayer {
  runner: Runner
  traits: DemoTraits
}

/** Plays one whole demo session. `iterations` lowers the code's key-derivation cost for bulk generation. */
export async function playDemo(seed: number, dep: DeploymentId, langs: Lang[], firm?: FirmLabels, iterations = 1000): Promise<DemoPlayer> {
  const rng = seeded(seed)
  const t = traits(rng)
  const runner = new Runner(seeded(seed * 7919 + 13), dep, langs, firm)
  let fairness = t.fairness
  let guard = 0
  while (!runner.done && guard++ < 1000) {
    const s = runner.current
    if (!s) break
    switch (s.kind) {
      case 'people':
        runner.answer(decideCard(rng, s.p, t))
        break
      case 'ordinary': {
        const best = s.d.options.slice().sort((a, b) => b.effect - a.effect)
        runner.answer(rng.next() < 0.6 ? best[0].id : rng.pick(s.d.options).id)
        break
      }
      case 'screening': {
        const item = s.id
        const isVignette = item === 'scr-04' || item === 'scr-08'
        runner.answer(isVignette ? rng.pick(['a', 'b', 'c', 'd']) : String(scaleAnswer(rng, fairness, rng.next() < 0.5 ? 'agree-fair' : 'disagree-fair')))
        break
      }
      case 'survey':
        runner.answer(scaleAnswer(rng, fairness, s.item.keying))
        break
      case 'xw-direct':
        runner.answer(rng.next() < 0.5)
        break
      case 'xw':
        runner.answer(rng.next() < 0.5 ? 'same' : 'different')
        break
      case 'm1h-direct':
        runner.answer(rng.next() < fairness)
        break
      case 'inbox': {
        const inc = inboxBank.find((i) => i.id === s.id)
        const yes = inc?.kind === 'harassment' ? 0.85 : 0.3
        const label = rng.next() < yes ? rng.int(3) : 3 + rng.int(3)
        runner.answer({ label, action: rng.pick(['talk-affected', 'talk-other', 'committee', 'manager', 'note', 'nothing']) })
        break
      }
      case 'note':
        if (s.note === 'c') fairness = Math.min(1, fairness + 0.25)
        runner.answer(null)
        break
      case 'recall':
        runner.answer(runner.note ?? 'none')
        break
      case 'probe':
        runner.answer(rng.next() < 0.5 ? ['sex', 'descriptions'] : ['descriptions'])
        break
      case 'prior':
        runner.answer(rng.next() < 0.9 ? 'no' : 'not-sure')
        break
      case 'demographics': {
        const d: Record<string, string> = {}
        if (dep !== 'firm') d.gender = rng.pick(['woman', 'man', 'woman', 'man', 'another', 'prefer-not'])
        d.religion = rng.pick(['hindu', 'hindu', 'hindu', 'hindu', 'muslim', 'christian', 'sikh', 'prefer-not'])
        d.region = rng.pick(['north', 'south', 'east', 'west', 'north-east', 'central'])
        runner.answer(d)
        break
      }
      case 'submit':
        await runner.prepareCode(iterations)
        runner.index += 1
        break
      default:
        runner.answer(null)
    }
  }
  if (!runner.keys) await runner.prepareCode(iterations)
  return { runner, traits: t }
}
