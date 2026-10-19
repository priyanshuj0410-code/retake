/**
 * The in-page half of `pnpm ux`: Nivel's checker (parity-tracker
 * knowledge/reviews/assets/ux-audit-checks.html, 2 Oct 2026) adapted to run on the current
 * screen instead of in one iframe per route, because the evaluator's screens are steps of one
 * session, not routes. Same measures: computed text contrast against the real background,
 * target sizes, accessible names, heading order, sideways overflow, title, skip link, live
 * region, text under 12 px. Changed: a skip link is required only where something focusable
 * comes before <main> (WCAG 2.4.1 is about repeated blocks; here focus lands on the heading),
 * and inactive controls are left out of the contrast count, as WCAG 1.4.3 exempts them.
 */
window.__uxCheck = function uxCheck(minTarget) {
  const d = document
  const w = window
  const R = {}
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const p = m[1].split(',').map(Number)
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }
  }
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
    return (x + 0.05) / (y + 0.05)
  }
  const bgOf = (el) => {
    let e = el
    while (e) {
      const c = parse(w.getComputedStyle(e).backgroundColor)
      if (c && c.a > 0.5) return c
      e = e.parentElement
    }
    return { r: 255, g: 255, b: 255 }
  }
  const vis = (e) => {
    const r = e.getBoundingClientRect()
    const cs = w.getComputedStyle(e)
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'
  }
  const name = (e) => {
    const by = e.getAttribute('aria-labelledby')
    const lab = by
      ? by
          .split(' ')
          .map((id) => d.getElementById(id)?.textContent ?? '')
          .join(' ')
      : ''
    const forLabel = e.id ? (d.querySelector(`label[for="${e.id}"]`)?.textContent ?? '') : ''
    const wrap = e.closest('label')?.textContent ?? ''
    return (
      (e.getAttribute('aria-label') || '').trim() ||
      lab.trim() ||
      (e.tagName === 'INPUT' ? '' : e.textContent.trim()) ||
      forLabel.trim() ||
      wrap.trim() ||
      e.getAttribute('title') ||
      ''
    )
  }
  R.title = d.title
  R.hOverflow = d.documentElement.scrollWidth - d.documentElement.clientWidth
  const els = [
    ...d.querySelectorAll(
      'a[href], button, input, select, textarea, summary, [role=option], [tabindex]:not([tabindex="-1"])',
    ),
  ].filter(vis)
  /* A radio or checkbox is hit through its whole label row, so the label is the target. */
  const hitBox = (e) => {
    const t =
      (e.type === 'radio' || e.type === 'checkbox') && e.closest('label') ? e.closest('label') : e
    const r = t.getBoundingClientRect()
    const a = w.getComputedStyle(t, '::after')
    const s = a.content !== 'none' && a.position === 'absolute'
    return [
      Math.max(r.width, s ? parseFloat(a.width) || 0 : 0),
      Math.max(r.height, s ? parseFloat(a.height) || 0 : 0),
    ]
  }
  const box = els.map((e) => {
    const [bw, bh] = hitBox(e)
    return {
      n: (name(e) || e.tagName).replace(/\s+/g, ' ').slice(0, 32),
      w: Math.round(bw),
      h: Math.round(bh),
    }
  })
  R.targets = box.length
  R.underTarget = box
    .filter((b) => b.w < minTarget || b.h < minTarget)
    .map((b) => `${b.n} ${b.w}x${b.h}`)
  R.noName = els.filter((e) => !name(e)).map((e) => e.outerHTML.slice(0, 100))
  R.h1 = d.querySelectorAll('h1').length
  const hs = [...d.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => +h.tagName[1])
  R.headingSkips = hs.filter((v, i) => (i === 0 ? v !== 1 : v - hs[i - 1] > 1)).length
  const texts = [...d.querySelectorAll('body *')].filter(
    (e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
  )
  const fails = []
  const small = []
  for (const e of texts) {
    const cs = w.getComputedStyle(e)
    const fs = parseFloat(cs.fontSize)
    const fw = +cs.fontWeight || 400
    if (fs < 12)
      small.push(
        `${e.textContent.trim().slice(0, 24)} ${fs}px .${String(e.className).slice(0, 24)}`,
      )
    if (e.closest('[disabled], [aria-disabled="true"]')) continue
    const fg = parse(cs.color)
    if (!fg || fg.a < 0.5) continue
    const cr = ratio(fg, bgOf(e))
    const large = fs >= 24 || (fs >= 18.66 && fw >= 700)
    if (cr < (large ? 3 : 4.5))
      fails.push(
        `${e.textContent.replace(/\s+/g, ' ').trim().slice(0, 24)} ${Math.round(cr * 100) / 100} .${String(e.className).slice(0, 24)} ${cs.color}`,
      )
  }
  R.text = texts.length
  R.textUnder12 = small
  R.contrastFails = fails
  R.skipLink = !!d.querySelector('a[href^="#main"], .skip-link')
  const main = d.querySelector('main')
  R.needsSkip =
    !!main && els.some((e) => main.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING)
  R.liveRegion = !!d.querySelector('[aria-live], [role=status], [role=alert]')
  R.needsLive = !!d.querySelector('.sort, .alloc')
  return R
}
