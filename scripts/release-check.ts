/**
 * Acceptance test 7: release only in cells of 50 or more. Requests cells of 49 and 50 and
 * confirms refusal and release; merges firm batch-months within the firm-month and never
 * across timing arms; keeps "prefer not to say" as its own cell; releases the employer's sex
 * result only for groups of 50 or more; merges or suppresses small demographic categories.
 */
import { config } from '../src/engine/config'
import {
  employerSexResult,
  releaseCategories,
  releaseCell,
  releaseFirm,
  type FirmCell,
} from '../src/release/release'
import { record } from './lib/check'

const T = 'AT-7 release only in cells of 50 or more'
const mean = <V>(cs: { n: number; value?: V }[]) =>
  cs.reduce((s, c) => s + Number(c.value ?? 0) * c.n, 0) / cs.reduce((s, c) => s + c.n, 0)

export async function run() {
  record(T, 'the registered minimum is 50', config.release.minCell === 50)
  record(T, 'a cell of 49 is refused', releaseCell({ label: 'x', n: 49, value: 0.1 }) === null)
  record(T, 'a cell of 50 is released', releaseCell({ label: 'x', n: 50, value: 0.1 })?.n === 50)
  record(
    T,
    "the employer's sex result: a group of 49 is refused, 50 released",
    employerSexResult({ label: 'firm', n: 49 }) === null &&
      employerSexResult({ label: 'firm', n: 50 }) !== null,
  )

  const cats = releaseCategories(
    [
      { label: 'hindu', n: 300, value: 1 },
      { label: 'muslim', n: 49, value: 2 },
      { label: 'christian', n: 20, value: 3 },
      { label: 'sikh', n: 10, value: 4 },
    ],
    mean,
  )
  record(
    T,
    'small categories are merged when the merged cell reaches 50',
    cats.released.some((c) => c.merged?.join() === 'muslim,christian,sikh' && c.n === 79) &&
      cats.suppressed.length === 0,
  )
  const sup = releaseCategories(
    [
      { label: 'hindu', n: 300 },
      { label: 'muslim', n: 30 },
      { label: 'sikh', n: 10 },
    ],
    mean,
  )
  record(
    T,
    'a merged cell still below 50 is suppressed, never reported short',
    sup.suppressed.join() === 'muslim,sikh' && sup.released.every((c) => c.n >= 50),
  )
  const lone = releaseCategories(
    [
      { label: 'a', n: 60 },
      { label: 'b', n: 49 },
    ],
    mean,
  )
  record(T, 'a single small category is suppressed, not relabelled', lone.suppressed.join() === 'b')

  const cell = (
    batch: string,
    timingArm: 'before' | 'after',
    sex: string,
    n: number,
  ): FirmCell => ({ firm: 'f', month: '2026-11', batch, timingArm, sex, n, value: 0 })
  const firm = releaseFirm(
    [
      cell('b1', 'before', 'woman', 30),
      cell('b2', 'before', 'woman', 25),
      cell('b1', 'after', 'woman', 40),
      cell('b3', 'before', 'man', 60),
      cell('b1', 'before', 'prefer-not', 20),
      cell('b2', 'before', 'prefer-not', 29),
      cell('b1', 'after', 'man', 49),
      cell('b2', 'after', 'man', 1),
    ],
    mean,
  )
  const lab = (s: string) => firm.released.find((c) => c.label.includes(s))
  record(
    T,
    'firm: small batches merge within the firm-month and timing arm',
    lab('before woman (batches merged)')?.n === 55,
  )
  record(
    T,
    'firm: never across timing arms (the after-arm 40 is not merged into the before arm)',
    firm.suppressed.some((s) => s.includes('b1 after woman')),
  )
  record(
    T,
    'firm: "prefer not to say" is its own cell under the same rule',
    firm.suppressed.some((s) => s.includes('prefer-not')) &&
      !firm.released.some((c) => c.label.includes('prefer-not')),
  )
  record(
    T,
    'firm: a batch of 50 or more is released alone',
    firm.released.some((c) => c.label === 'f 2026-11 b3 before man' && c.n === 60),
  )
  record(
    T,
    'firm: a merged after-arm cell of 49 + 1 = 50 is released',
    lab('after man (batches merged)')?.n === 50,
  )
  record(
    T,
    'firm: nothing released below 50',
    firm.released.every((c) => c.n >= 50),
  )
}
