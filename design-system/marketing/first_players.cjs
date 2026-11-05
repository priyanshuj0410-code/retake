// Draws the two real screens from a production build, then prints first-players.html to a PDF and one PNG a page (EVAL-25).
const { chromium } = require('playwright-core')
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const HERE = __dirname
const ROOT = path.join(HERE, '../..')
const flow = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/take/first-take.json'), 'utf8')).flow
const at = (f) => flow.findIndex(f)
;(async () => {
  const server = spawn('python3', ['-m', 'http.server', '5412'], { cwd: path.join(ROOT, 'out/mkt-dist'), stdio: 'ignore' })
  await new Promise((r) => setTimeout(r, 900))
  const b = await chromium.launch({ channel: 'chrome', headless: true })
  const open = async (state) => {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true })
    const p = await c.newPage()
    await p.goto('http://localhost:5412/')
    await p.evaluate((s) => localStorage.setItem('retake.take', JSON.stringify(s)), { v: 1, answers: {}, lang: 'en', sound: false, birth: '1990-08-14', ...state })
    await p.reload()
    await p.locator('.take .app').waitFor()
    await p.waitForTimeout(600)
    return p
  }
  let p = await open({ at: at((s) => s.id === process.env.DECISION) })
  await p.screenshot({ path: path.join(HERE, 'art/screen-decision.png') })
  p = await open({ at: at((s) => s.type === 'results'), rate: 'ask' })
  await p.getByRole('radio', { name: '4 stars' }).check({ force: true })
  await p.evaluate(() => document.activeElement?.blur())
  await p.waitForTimeout(250)
  // the sheet alone: the reading under it is never shown
  await p.locator('.ratesheet').screenshot({ path: path.join(HERE, 'art/screen-rating.png') })
  server.kill()

  const page = await b.newPage({ viewport: { width: 1080, height: 1350 } })
  await page.goto('file://' + path.join(HERE, 'first-players.html'))
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(800)
  console.log('fonts', await page.evaluate(() => ['Hind', 'Sarpanch'].map((f) => `${f}:${document.fonts.check(`700 40px ${f}`)}`).join(' ')))
  const over = await page.evaluate(() => [...document.querySelectorAll('.s *')].filter((e) => { const r = e.getBoundingClientRect(), s = e.closest('.s').getBoundingClientRect(); return !e.matches('img,svg,path') && e.textContent.trim() && (r.right > s.right + 1 || r.bottom > s.bottom + 1) }).map((e) => e.className || e.tagName))
  console.log('text past the page edge', JSON.stringify(over))
  await page.pdf({ path: path.join(HERE, 'retake-first-players.pdf'), width: '1080px', height: '1350px', printBackground: true, preferCSSPageSize: true })
  const slides = page.locator('.s')
  fs.mkdirSync(path.join(HERE, 'pages'), { recursive: true })
  for (let i = 0; i < (await slides.count()); i++) await slides.nth(i).screenshot({ path: path.join(HERE, `pages/${i + 1}.png`) })
  await b.close()
})().catch((e) => { console.error(e); process.exit(1) })
