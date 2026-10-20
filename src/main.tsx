import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import { App } from './App'
import { registerServiceWorker } from './pwa'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

registerServiceWorker()

/* Print (EVAL-11): every fold and "Read the full details" prints open, and closes again after. */
let closed: HTMLDetailsElement[] = []
addEventListener('beforeprint', () => {
  closed = [...document.querySelectorAll('details')].filter((d) => !d.open)
  closed.forEach((d) => (d.open = true))
})
addEventListener('afterprint', () => {
  closed.forEach((d) => (d.open = false))
  closed = []
})
