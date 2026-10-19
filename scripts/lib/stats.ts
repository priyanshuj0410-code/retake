/** Chi-square tests for the randomisation check. */
function lgamma(x: number): number {
  const c = [
    76.18009172947146, -86.50532032941678, 24.01409824083091, -1.231739572450155,
    0.001208650973866179, -0.000005395239384953,
  ]
  let y = x
  const tmp = x + 5.5 - (x + 0.5) * Math.log(x + 5.5)
  let ser = 1.000000000190015
  for (const ci of c) ser += ci / ++y
  return -tmp + Math.log((2.5066282746310002 * ser) / x)
}

/** Regularised upper incomplete gamma Q(a, x). */
function gammaQ(a: number, x: number): number {
  if (x < a + 1) {
    let sum = 1 / a
    let del = sum
    let ap = a
    for (let n = 0; n < 500; n++) {
      ap += 1
      del *= x / ap
      sum += del
      if (Math.abs(del) < Math.abs(sum) * 1e-14) break
    }
    return 1 - sum * Math.exp(-x + a * Math.log(x) - lgamma(a))
  }
  let b = x + 1 - a
  let c = 1e300
  let d = 1 / b
  let h = d
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a)
    b += 2
    d = an * d + b
    if (Math.abs(d) < 1e-300) d = 1e-300
    c = b + an / c
    if (Math.abs(c) < 1e-300) c = 1e-300
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < 1e-14) break
  }
  return Math.exp(-x + a * Math.log(x) - lgamma(a)) * h
}

export const chiSquareP = (stat: number, df: number) => gammaQ(df / 2, stat / 2)

/** Goodness of fit of observed counts to expected probabilities. */
export function gof(observed: number[], probs: number[]): { stat: number; df: number; p: number } {
  const n = observed.reduce((a, b) => a + b, 0)
  let stat = 0
  observed.forEach((o, i) => {
    const e = n * probs[i]
    stat += (o - e) ** 2 / e
  })
  const df = observed.length - 1
  return { stat, df, p: chiSquareP(stat, df) }
}

/**
 * Independence in an r x c contingency table. `scale` corrects for a design whose counts are
 * not multinomial: under the restricted randomisation every card holds exactly two focal and
 * two comparison characters, so a card's four indicators have variance 1/4 and covariance
 * -1/12, and the plain statistic is inflated by 4/3 (its mean is 4 on 3 df). Multiplying by
 * 3/4 restores the chi-square(3) reference. The same factor holds for a 2 x 2 of two
 * independent restricted labellings (a card's joint count is hypergeometric, variance 1/3).
 */
export function independence(
  table: number[][],
  scale = 1,
): { stat: number; df: number; p: number } {
  const rows = table.map((r) => r.reduce((a, b) => a + b, 0))
  const cols = table[0].map((_, j) => table.reduce((a, r) => a + r[j], 0))
  const n = rows.reduce((a, b) => a + b, 0)
  let stat = 0
  table.forEach((r, i) =>
    r.forEach((o, j) => {
      const e = (rows[i] * cols[j]) / n
      if (e > 0) stat += (o - e) ** 2 / e
    }),
  )
  stat *= scale
  const df = (table.length - 1) * (table[0].length - 1)
  return { stat, df, p: chiSquareP(stat, df) }
}
