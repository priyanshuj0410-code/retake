import type { ReactNode } from 'react'
import './actions.css'

/**
 * The one action pattern on every screen (EVAL-10, owner): the primary button first, full
 * width on phones and left-aligned from 600 px, then at most one quiet secondary on the same
 * edge. Page uses it for the screen's row; TapOrder and QuickSplit use it for "Confirm" and
 * "Clear", so no action row sits at another indent. Back is never here: it is the small nav
 * link at the top of the screen (`Page nav`).
 */
export function Actions({ children, pin }: { children: ReactNode; pin?: boolean }) {
  return <div className={pin ? 'actions actions--pinned' : 'actions'}>{children}</div>
}
