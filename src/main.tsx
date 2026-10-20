import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import { App, applySkin, effectiveDate } from './App'
import { registerServiceWorker } from './pwa'

applySkin(effectiveDate(location.hash.split('?')[1] ?? ''), location.hash.replace(/^#/, '').split('?')[0])

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

registerServiceWorker()
