/**
 * Demo results: seeded demo players, run through the real session, reported through the
 * release rule. Shows the suppression, not a finding: the players and their decisions are
 * invented (src/demo/players.ts).
 */
import { useState } from 'react'
import { config } from '../engine/config'
import { characterScores } from '../engine/score'
import { playDemo, type DemoPlayer } from '../demo/players'
import { releaseCategories, type Cell } from '../release/release'
import { Button, Heading, Notice, Page, Table, Text } from '../ui'

interface Row {
  group: string
  delta: number
}

function sexContrast(
  pl: DemoPlayer,
  filter: (a: { lang: string; pres: string }) => boolean,
): number | null {
  const w: number[] = []
  const m: number[] = []
  for (const a of pl.runner.answers.people.values()) {
    if (
      a.p.family !== 'opportunity' ||
      a.p.baseline ||
      a.p.rematch ||
      !filter({ lang: a.p.lang, pres: a.p.presentation })
    )
      continue
    const s = characterScores(a.p.card, a)
    a.p.chars.forEach((c, i) => (c.sex === 'woman' ? w : m).push(s[i]))
  }
  if (!w.length || !m.length) return null
  const mean = (xs: number[]) => xs.reduce((x, y) => x + y, 0) / xs.length
  return mean(w) - mean(m)
}

const meanCell = (rows: Row[], label: string): Cell => ({
  label,
  n: rows.length,
  value: rows.length ? rows.reduce((s, r) => s + r.delta, 0) / rows.length : undefined,
})

export function Results() {
  const [n, setN] = useState(120)
  const [players, setPlayers] = useState<DemoPlayer[] | null>(null)
  const [busy, setBusy] = useState(false)
  const run = async () => {
    setBusy(true)
    const out: DemoPlayer[] = []
    for (let i = 0; i < n; i++) out.push(await playDemo(1000 + i, 'panel-g1', ['en', 'hinglish']))
    setPlayers(out)
    setBusy(false)
  }
  const fmt = (v?: number) => (v === undefined ? '' : v.toFixed(3))
  const tables: { caption: string; cells: Cell[] }[] = []
  if (players) {
    const by = (
      key: (p: DemoPlayer) => string,
      filter: (a: { lang: string; pres: string }) => boolean = () => true,
    ) => {
      const groups = new Map<string, Row[]>()
      for (const p of players) {
        const d = sexContrast(p, filter)
        if (d === null) continue
        const g = key(p)
        groups.set(g, [...(groups.get(g) ?? []), { group: g, delta: d }])
      }
      return [...groups].map(([g, rows]) => meanCell(rows, g))
    }
    tables.push({
      caption: 'Woman-cued minus man-cued mean score on opportunity cards, by R1 arm',
      cells: by((p) => p.runner.session.draws.arm),
    })
    tables.push({
      caption: 'The same, by note (low and high scorers pooled)',
      cells: by((p) => `note ${p.runner.note ?? 'none'}, ${p.runner.route}`),
    })
    tables.push({
      caption: 'The same, human cards only, by screening split',
      cells: by(
        (p) => p.runner.split ?? 'none',
        (a) => a.pres === 'human',
      ),
    })
    const rel = new Map<string, number>()
    for (const p of players) {
      const r = p.runner.answers.demographics.religion
      if (r) rel.set(r, (rel.get(r) ?? 0) + 1)
    }
    tables.push({
      caption:
        'Demographic mix: religion (an unlinked count; small categories merged or suppressed)',
      cells: [...rel].map(([label, n]) => ({ label, n, value: n })),
    })
  }
  return (
    <Page
      surface="oof"
      stepKey="results"
      demo={config.demo ? 'Demo: invented players, not a finding' : undefined}
      title="Demo results through the release rule"
      actions={
        <Button onClick={() => void run()} disabled={busy}>
          {busy ? 'Playing demo sessions' : `Play ${n} demo sessions`}
        </Button>
      }
    >
      <Text>
        Every cell below {config.release.minCell} people is merged with the other small categories,
        or suppressed if the merged cell is still short. Change the number of demo players to watch
        cells cross the line.
      </Text>
      <Button kind="secondary" onClick={() => setN(n === 120 ? 400 : 120)}>
        {`Use ${n === 120 ? 400 : 120} demo players`}
      </Button>
      {tables.map((t) => {
        const r = releaseCategories(t.cells, (cs) => {
          const tot = cs.reduce((s, c) => s + c.n, 0)
          return cs.reduce((s, c) => s + (c.value ?? 0) * c.n, 0) / tot
        })
        return (
          <section key={t.caption}>
            <Heading>{t.caption}</Heading>
            <Table
              caption={t.caption}
              head={['Group', 'People', 'Value']}
              rows={[
                ...r.released.map((c) => ({
                  cells: [
                    c.merged ? `${c.label}: ${c.merged.join(', ')}` : c.label,
                    String(c.n),
                    t.caption.startsWith('Demographic') ? String(c.n) : fmt(c.value),
                  ],
                })),
                ...r.suppressed.map((label) => ({
                  cells: [label, `fewer than ${config.release.minCell}`, 'suppressed'],
                  suppressed: true,
                })),
              ]}
            />
          </section>
        )
      })}
      {players === null ? <Notice>No demo players yet.</Notice> : null}
    </Page>
  )
}
