import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { serviceWorker } from './scripts/pwa/plugin.ts'

/** The site's own address in the link-preview tags: Vercel's production domain at build (a system environment
 * variable), else SITE_URL, else none, so the tags read as paths on a local build. */
const site = (): Plugin => {
  const host = process.env.SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
  return { name: 'retake-site', transformIndexHtml: (html) => html.replaceAll('%SITE%', host.replace(/\/$/, '')) }
}

/** The library's stylesheets in public/take/ keep their names in every version, so each link carries a fingerprint
 * of the file: a new deploy's page always asks for its own styles, never a browser's copy of the last version's. */
const fingerprint = (): Plugin => ({
  name: 'retake-fingerprint',
  transformIndexHtml: (html) =>
    html.replace(/href="\/take\/([\w./-]+\.css)"/g, (_, f: string) => {
      const v = createHash('sha256').update(readFileSync(new URL(`./public/take/${f}`, import.meta.url))).digest('hex').slice(0, 10)
      return `href="/take/${f}?v=${v}"`
    }),
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), site(), fingerprint(), serviceWorker()],
})
