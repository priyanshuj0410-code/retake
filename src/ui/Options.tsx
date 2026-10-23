import type { ReactNode } from 'react'
import './options.css'

/**
 * The container of one set of answer options; ux-audit checks its children look alike. A
 * `legend` names the numbers every option shows, once, instead of on every option.
 */
export function Options(props: {
  children: ReactNode
  label: string
  role?: 'radiogroup' | 'group'
  columns?: 1 | 2 | 4
  legend?: string[]
}) {
  return (
    <div className="options__wrap">
      {props.legend ? (
        <p className="options__legend" aria-hidden="true">
          {props.legend.join(' · ')}
        </p>
      ) : null}
      <div className="options" role={props.role ?? 'group'} aria-label={props.label} data-columns={props.columns ?? 1} data-options="">
        {props.children}
      </div>
    </div>
  )
}
