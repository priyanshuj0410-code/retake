import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { serviceWorker } from './scripts/pwa/plugin.ts'

/** The site's own address in the link-preview tags: Vercel's production domain at build (a system environment
 * variable), else SITE_URL, else none, so the tags read as paths on a local build. */
const site = (): Plugin => {
  const host = process.env.SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
  return { name: 'retake-site', transformIndexHtml: (html) => html.replaceAll('%SITE%', host.replace(/\/$/, '')) }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), site(), serviceWorker()],
})
