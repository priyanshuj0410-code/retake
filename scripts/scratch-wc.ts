import { newPlayer, open, phone, seed, startApp } from './lib/app'
import { playDay } from './lib/bot'
import { anchorDate } from '../src/engine/calendar'
import { countWords, names, PAGE_TEXT } from './lib/wordcount'
const app = await startApp(5341)
const page = await phone(app.browser)
const N = names([{ a: 'ghat', b: 'jugnu' }])
const show = async (label: string) => { const t = (await page.evaluate(PAGE_TEXT)) as string; const w = countWords(t, N); console.log(`${label}\t${w.length}\t${w.join(' ')}`) }
await seed(page, app.base, null)
await open(page, app.base, '#/?day=1'); await show('language')
await page.getByRole('radio', { name: 'English' }).click(); await page.waitForSelector('h1'); await show('road name')
await seed(page, app.base, newPlayer())
await open(page, app.base, '#/?day=1'); await show('today L-mon')
for (const n of [1, 3, 4, 5, 6, 8]) {
  let shown = false
  await playDay(page, app.base, anchorDate(n), 'consistent', async (st, p) => { if (p === 'ready' && !shown) { shown = true; await show(`play ${n} ${st.kind}`) } })
  if (n === 1) await show('result L-mon')
}
await open(page, app.base, '#/week?day=7'); await show('week L-sun')
await open(page, app.base, '#/board?day=7'); await show('board')
await app.close()
