/** A tiny harness: every check records named results under the acceptance test it serves. */
export interface Result {
  test: string
  name: string
  ok: boolean
  detail: string
}

export const results: Result[] = []

export function record(test: string, name: string, ok: boolean, detail = '') {
  results.push({ test, name, ok, detail })
}

export function summary(): boolean {
  const byTest = new Map<string, Result[]>()
  for (const r of results) byTest.set(r.test, [...(byTest.get(r.test) ?? []), r])
  let allOk = true
  for (const [test, rs] of byTest) {
    const ok = rs.every((r) => r.ok)
    allOk &&= ok
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${test}  (${rs.filter((r) => r.ok).length}/${rs.length})`)
    for (const r of rs)
      if (!r.ok || process.env.VERBOSE)
        console.log(`        ${r.ok ? 'ok  ' : 'FAIL'} ${r.name}${r.detail ? `: ${r.detail}` : ''}`)
  }
  return allOk
}
