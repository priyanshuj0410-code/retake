/**
 * Writes dist/sw.js at the end of a production build (EVAL-7): the template in scripts/pwa/sw.js with the precache
 * list (the shell, hashed scripts and styles, the library's styles, fonts, sound engines and the pictures every phone
 * draws, icons, the manifest), the pictures cached when first shown, each file with a revision hashed from its
 * contents, and a version hashed from all of them. The dev server has no service worker.
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
      const all = walk(outDir)
        .map((f) => relative(outDir, f).split('\\').join('/'))
        .filter((f) => f !== 'sw.js' && !f.endsWith('.map') && !f.startsWith('.'))
        .sort()
      /** The pictures not every phone needs: cached when first shown or ahead of a chapter, kept across updates. */
      const isPic = (f: string) => /^take\/assets\/cut-/.test(f) || /^take\/assets\/.*-[lw]\.webp$/.test(f)
      const files = all.filter(
        (f) =>
          // index.html is the shell, precached as './'; art/ and fonts/ belong to the turned-down build (EVAL-13)
          // until M1 removes them; the install dialog's screenshots and the link preview are for the browser and
          // chats, never drawn by the app; /demo/ is the team's page, never touched by the worker
          f !== 'index.html' &&
          !/^(art|fonts|screenshots|demo)\//.test(f) &&
          f !== 'icons/og.png' &&
          !isPic(f),
      )
      const rev = (f: string) => createHash('sha256').update(readFileSync(join(outDir, f))).digest('hex').slice(0, 12)
      const precache = [['./', rev('index.html')], ...files.map((f) => [`./${f}`, rev(f)])]
      const pics = Object.fromEntries(all.filter(isPic).map((f) => [`/${f}`, rev(f)]))
      const version = createHash('sha256').update(JSON.stringify([precache, pics])).digest('hex').slice(0, 12)
      const sw = readFileSync(new URL('./sw.js', import.meta.url), 'utf8')
        .replace('__VERSION__', version)
        .replace('__PRECACHE__', JSON.stringify(precache))
        .replace('__PICS__', JSON.stringify(pics))
      writeFileSync(join(outDir, 'sw.js'), sw)
    },
  }
}
