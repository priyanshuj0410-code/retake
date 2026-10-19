/**
 * The character score s in [0, 1], higher better for the character (candidates v12, 3.3):
 * ranking cards the normalised rank (k minus rank) / (k minus 1); allocation cards the
 * character's share. NPT cards are allocations of unwanted work, so their share is higher
 * for more unwanted work. The tool never scores an answer right or wrong.
 */
import type { PeopleCard } from '../content/types'

/** `order` lists character indices from the top slot down; `units` gives each character's units. */
export function characterScores(card: PeopleCard, answer: { order?: number[]; units?: number[] }): number[] {
  if (card.type === 'allocation') {
    const units = answer.units ?? [0, 0, 0, 0]
    const total = units.reduce((a, b) => a + b, 0) || 1
    return units.map((u) => u / total)
  }
  const order = answer.order ?? [0, 1, 2, 3]
  const k = order.length
  const s = Array<number>(k).fill(0)
  order.forEach((ci, rank) => (s[ci] = (k - 1 - rank) / (k - 1)))
  return s
}
