import type { ReactNode } from 'react'
import './options.css'

/** The container of one set of answer options; ux-audit checks its children look alike. */
export function Options(props: {
  children: ReactNode
  label: string
  role?: 'radiogroup' | 'group'
  columns?: 1 | 2 | 4
}) {
  return (
    <div className="options" role={props.role ?? 'group'} aria-label={props.label} data-columns={props.columns ?? 1} data-options="">
      {props.children}
    </div>
  )
}
