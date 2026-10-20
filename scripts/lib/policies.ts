/**
 * Synthetic players for the scoring check: an answer to every step from a policy, without a
 * browser. `even` follows its own rule and its own earlier choices and alternates ties;
 * `women` and `men` favour one side in every tie, check and word; `random` is noise.
 */
import { cast, type Step } from '../../src/content'
import type { Answer } from '../../src/engine/answers'
import type { Rng } from '../../src/engine/rng'

export type Policy = 'even' | 'women' | 'men' | 'random'

export function answerFor(step: Step, policy: Policy, rng: Rng, flip: { n: number }): Answer {
  const g = (who: string) => cast(who).gender
  const favoured = (who: string) => (policy === 'women' ? g(who) === 'w' : policy === 'men' ? g(who) === 'm' : false)
  /** Orders a tie: the favoured side first, or alternate sides for the even player. */
  const tie = (whos: string[]) => {
    if (policy === 'random') return rng.shuffle(whos)
    if (policy === 'even') {
      flip.n++
      const first = flip.n % 2 ? 'w' : 'm'
      return [...whos].sort((a, b) => (g(a) === first ? -1 : 0) - (g(b) === first ? -1 : 0))
    }
    return [...whos].sort((a, b) => (favoured(a) ? -1 : 0) - (favoured(b) ? -1 : 0))
  }
  const ranked = <T,>(xs: T[], key: (x: T) => number, who: (x: T) => string) => {
    const keys = [...new Set(xs.map(key))].sort((a, b) => b - a)
    return keys.flatMap((k) => tie(xs.filter((x) => key(x) === k).map(who)))
  }
  switch (step.kind) {
    case 'assign': {
      const rule = step.rules[0]
      const order = ranked(step.people, (p) => p.values[rule.key], (p) => p.who)
      return {
        kind: 'assign',
        rule: rule.id,
        locked: true,
        slots: Object.fromEntries(step.slots.map((s, i) => [s.id, order[i]])),
      }
    }
    case 'rank': {
      const rule = step.rules![0]
      return { kind: 'rank', rule: rule.id, locked: true, order: ranked(step.people, (p) => p.values![rule.key], (p) => p.who) }
    }
    case 'pick': {
      const people = step.options.filter((o) => o.who)
      if (policy === 'random') return { kind: 'pick', choice: rng.pick(step.options).id }
      const evenOption = step.options.find((o) => !o.who)
      if (policy === 'even')
        return { kind: 'pick', choice: (people.find((o) => o.profile === 'confident') ?? evenOption ?? people[flip.n++ % 2]).id }
      return { kind: 'pick', choice: people.find((o) => favoured(o.who!))!.id }
    }
    case 'checks': {
      const checks = Object.fromEntries(step.people.map((p) => [p.who, 0]))
      const mirrors = step.people.filter((p) => p.mirror)
      if (policy === 'even') for (const p of step.people) checks[p.who] = 1
      else if (policy === 'random') for (let i = 0; i < step.budget; i++) checks[rng.pick(step.people).who]++
      else checks[mirrors.find((p) => !favoured(p.who))!.who] = step.budget
      const third = step.people.find((p) => !p.mirror)!.who
      const choice =
        policy === 'even' ? third : policy === 'random' ? rng.pick(step.people).who : mirrors.find((p) => favoured(p.who))!.who
      return { kind: 'checks', checks, choice }
    }
    case 'team': {
      const order = ranked(step.people, (p) => p.value, (p) => p.who)
      const restrictsOther =
        policy === 'women' ? step.voice.target === 'm' : policy === 'men' ? step.voice.target === 'w' : false
      const response =
        policy === 'random' ? rng.pick(step.responses).id : restrictsOther ? 'comply' : 'ride'
      return { kind: 'team', picked: order.slice(0, step.seats), response }
    }
    case 'words': {
      const good = step.bank.filter((b) => b.valence > 0).map((b) => b.id)
      const bad = step.bank.filter((b) => b.valence < 0).map((b) => b.id)
      const pickFor = (who: string) =>
        policy === 'random'
          ? [rng.pick(step.bank).id, rng.pick(step.bank).id]
          : policy === 'even' || favoured(who)
            ? good.slice(0, 2)
            : bad.slice(0, 2)
      return { kind: 'words', notes: Object.fromEntries(step.people.map((p) => [p, pickFor(p)])) }
    }
    case 'swipe':
      return {
        kind: 'swipe',
        verdicts: Object.fromEntries(
          step.items.map((i) => [
            i.id,
            policy === 'random' ? (rng.next() < 0.5 ? 'cut' : 'keep') : policy === 'even' || favoured(i.who) ? 'cut' : 'keep',
          ]),
        ),
      }
    case 'crowd':
      return { kind: 'crowd', guess: policy === 'random' ? rng.int(21) * 5 : 60 }
  }
}
