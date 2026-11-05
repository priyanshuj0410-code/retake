/**
 * The private reading's chores (audit of 25 Oct 2026, finding 2; EVAL-24): in Split the person spared a chore is the
 * favoured one, and now in the loft and the storeroom too. The audit's two cases are held here, as the player would read
 * them on card 3, along with the people the cards count.
 */
import { TAKE } from '../src/take/data'
import { favoured, leanOf, readingOf, twinOf } from '../src/take/reading'
import type { Answer } from '../src/take/steps/common'
import { record } from './lib/check'

const T = 'R the reading: chores count the same way everywhere'
const A = (x: Record<string, unknown>) => x as Record<string, Answer>

export async function run() {
  const burdens = Object.entries(TAKE.results.decisions).filter(([, d]) => d.burden).map(([id]) => id).sort()
  record(T, 'the loft and the storeroom are the two decisions marked as a chore', burdens.join() === 'rukavat-3,rukavat-7', burdens.join())
  const [wL, mL] = ['Deepa', 'Chetan']
  const bothL = TAKE.results.decisions['rukavat-3'].pair
  record(T, "the loft's hidden two are a woman and a man", bothL.includes(wL) && bothL.includes(mL))
  record(T, 'given the loft, the woman is not the favoured one: the man left out is', favoured('rukavat-3', { set: [wL, 'Uma'] } as Answer) === mL)
  record(T, 'and the other way round', favoured('rukavat-3', { set: [mL, 'Uma'] } as Answer) === wL)
  record(T, 'both given it: no favour', favoured('rukavat-3', { set: [wL, mL] } as Answer) === null)
  const crew = TAKE.results.decisions['station-1'].pair
  record(T, 'a decision that is not a chore still favours the one chosen', favoured('station-1', { set: [crew[0], 'Prakash'] } as Answer) === crew[0])

  const dust = { 'rukavat-3': { set: ['Deepa', 'Uma'] }, 'rukavat-7': { set: ['Pooja', 'Kunal'] } }
  const a = readingOf(A(dust))
  record(T, 'case A, the loft and storeroom both given to the women: card 3 says the woman gets the chores', leanOf(a.twins)?.line[0] === 'Same free hours, but the woman gets the chores.', leanOf(a.twins)?.line[0])
  record(T, 'case A: card 1 counts the men, the ones let off', a.m === 2 && a.w === 0 && a.more === 'm', `man ${a.m}, woman ${a.w}`)
  const b = readingOf(A({ ...dust, 'rukavat-1': { chores: { Uma: 3, Vivek: 0 } }, 'rukavat-5': { chores: { Shampa: 3, Kunal: 0 } } }))
  record(T, 'case B, the women given every chore in all four: card 3 says the same, no longer "close to even"', leanOf(b.twins)?.line[0] === 'Same free hours, but the woman gets the chores.', leanOf(b.twins)?.line[0])
  record(T, 'case B: card 1 counts all four', b.m === 4 && b.w === 0, `man ${b.m}, woman ${b.w}`)
  const mirror = readingOf(A({ 'rukavat-3': { set: ['Chetan', 'Uma'] }, 'rukavat-7': { set: ['Pooja', 'Kunal'].map((n) => (n === 'Pooja' ? TAKE.results.decisions['rukavat-7'].pair.find((p) => TAKE.results.decisions['rukavat-7'].sex[p] === 'm')! : n)) } }))
  record(T, 'the mirror: the chores given to the men say the man gets the chores', leanOf(mirror.twins)?.line[0] === 'Same free hours, but the man gets the chores.', leanOf(mirror.twins)?.line[0])
  // card 2: the sentence and the mark, on both kinds of chore
  const dustTwin = twinOf(a)
  record(T, 'card 2, loft and storeroom: says who got more, and marks her, the one the player tapped', /You gave the woman more both times\./.test(dustTwin?.text[0] ?? '') && dustTwin?.marked['rukavat-3'] === 'Deepa', dustTwin?.text[0])
  const fair = twinOf(readingOf(A({ 'rukavat-1': { chores: { Uma: 1, Vivek: 0 } }, 'rukavat-5': { chores: { Shampa: 1, Kunal: 0 } } })))
  record(T, 'card 2, Split: the same words, true when both did chores', /The TV swapped sides\. You gave the woman more both times\./.test(fair?.text[0] ?? ''), fair?.text[0])
  const plain = twinOf(readingOf(A({ 'station-3': { pick: TAKE.results.decisions['station-3'].pair[0] }, 'station-7': { pick: TAKE.results.decisions['station-7'].pair.find((p) => TAKE.results.decisions['station-7'].sex[p] === TAKE.results.decisions['station-3'].sex[TAKE.results.decisions['station-3'].pair[0]]) } })))
  record(T, 'card 2, not a chore: "picked", and the one picked is marked', /You picked the (man|woman) both times\./.test(plain?.text[0] ?? '') && plain?.marked['station-3'] === TAKE.results.decisions['station-3'].pair[0], plain?.text[0])
  record(T, 'no answers: nothing leans', leanOf(readingOf({}).twins) === null)
}
