/**
 * The checks' harness: the app on a local Vite server, Chrome through playwright-core, and a
 * page at a phone's width with a saved state seeded into this device's storage.
 */
import { chromium, type Browser, type Page } from 'playwright-core'
import { createServer, type ViteDevServer } from 'vite'
import type { Saved } from '../../src/store'

const ROOT = new URL('../..', import.meta.url).pathname

export async function startApp(port: number) {
  const server: ViteDevServer = await createServer({
    root: ROOT,
    logLevel: 'error',
    server: { port, strictPort: true },
  })
  await server.listen()
  const browser: Browser = await chromium.launch({ channel: 'chrome' })
  return {
    base: `http://localhost:${port}/`,
    browser,
    async close() {
      await browser.close()
      await server.close()
    },
  }
}

export async function phone(
  browser: Browser,
  opts: { width?: number; height?: number; reduced?: boolean } = {},
): Promise<Page> {
  const ctx = await browser.newContext({
    viewport: { width: opts.width ?? 390, height: opts.height ?? 844 },
    deviceScaleFactor: 2,
    reducedMotion: opts.reduced === false ? 'no-preference' : 'reduce',
    hasTouch: true,
  })
  return ctx.newPage()
}

/** A player who has chosen a language and a road name and played nothing yet. */
export const newPlayer = (lang: 'en' | 'hi' = 'en'): Saved => ({
  v: 1,
  lang,
  seed: 7,
  handle: { a: 'ghat', b: 'jugnu' },
  friends: [],
  days: {},
  notes: {},
})

export async function seed(page: Page, base: string, saved: Saved | null) {
  await page.goto(`${base}#/dev`)
  await page.evaluate((s) => {
    localStorage.clear()
    sessionStorage.clear()
    if (s) localStorage.setItem('elt:v1', JSON.stringify(s))
  }, saved)
  await page.goto('about:blank')
}

export async function open(page: Page, base: string, hash: string) {
  await page.goto('about:blank')
  await page.goto(`${base}${hash}`)
  await page.waitForSelector('h1')
  await page.evaluate(() => document.fonts.ready)
}
