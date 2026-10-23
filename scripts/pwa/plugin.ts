/**
 * Writes dist/sw.js at the end of a production build (EVAL-7): the template in scripts/pwa/sw.js
 * with every file the build emitted (the shell, hashed scripts and styles, fonts, art,
 * icons, the manifest) as the precache list, and a version hashed from their contents. The dev
 * server has no service worker.
 */
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import type { Plugin } from 'vite'

const walk = (d: string): string[] =>
  readdirSync(d).flatMap((n) =>
    statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)],
  )

export function serviceWorker(): Plugin {
  let outDir = 'dist'
  return {
    name: 'elt-sw',
    apply: 'build',
    configResolved(c) {
      outDir = resolve(c.root, c.build.outDir)
    },
    closeBundle() {
      const files = walk(outDir)
        .map((f) => relative(outDir, f).split('\\').join('/'))
        // art/ and fonts/ belong to the turned-down build (EVAL-13) until M1 removes them; the First take uses take/
        // the cutscene panels are cached as each is first shown (sw.js), not on install; the install dialog's
        // screenshots and the link preview are for the browser and chats, never drawn by the app
        .filter(
          (f) =>
            f !== 'sw.js' &&
            !f.endsWith('.map') &&
            !f.startsWith('.') &&
            !/^(art|fonts|screenshots)\//.test(f) &&
            !/^take\/assets\/cut-/.test(f) &&
            f !== 'icons/og.png',
        )
        .sort()
      const hash = createHash('sha256')
      for (const f of files) hash.update(f).update(readFileSync(join(outDir, f)))
      const list = ['./', ...files.map((f) => `./${f}`)]
      const sw = readFileSync(new URL('./sw.js', import.meta.url), 'utf8')
        .replace('__VERSION__', hash.digest('hex').slice(0, 12))
        .replace('__PRECACHE__', JSON.stringify(list))
      writeFileSync(join(outDir, 'sw.js'), sw)
    },
  }
}
