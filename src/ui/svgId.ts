import { useId } from 'react'

/** A clean id for SVG references (React's ids may hold characters a url() cannot). */
export const useSvgId = () => `pt${useId().replace(/[^a-zA-Z0-9]/g, '')}`
