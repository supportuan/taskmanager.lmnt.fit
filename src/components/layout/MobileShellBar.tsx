import { Menu } from 'lucide-react'
import { TaskFlowLogo } from './TaskFlowLogo'

interface MobileShellBarProps {
  onOpenMenu: () => void
}

export function MobileShellBar({ onOpenMenu }: MobileShellBarProps) {
  return (
    <div className="fixed left-4 top-[calc(1rem+3px)] z-[160] flex max-w-[calc(100vw-5.5rem)] items-center gap-2 lg:hidden">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation menu"
        className="glass-icon-btn relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
      >
        <Menu className="h-5 w-5" strokeWidth={2} />
      </button>
      <div className="min-w-0 flex-1 truncate pr-1">
        <TaskFlowLogo />
      </div>
    </div>
  )
}
