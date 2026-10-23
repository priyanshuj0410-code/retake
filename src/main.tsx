import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './take/take.css'
import { Take } from './take/Take'
import { registerServiceWorker } from './pwa'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Take />
  </StrictMode>,
)

registerServiceWorker()
