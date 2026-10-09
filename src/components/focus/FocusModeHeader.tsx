import { Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { focusStatusLabel } from '../../utils/focusUtils'
import type { TrackerWorkflowStatus } from '../../types/tracker'

interface FocusModeHeaderProps {
  workflow: TrackerWorkflowStatus | undefined
  focusRunning: boolean
  focusPaused: boolean
  sessionComplete: boolean
}

function statusTone(label: string): string {
  if (label === 'FOCUSING' || label === 'IN PROGRESS') return 'text-primary-cyan'
  if (label === 'PAUSED') return 'text-warning'
  if (label === 'SESSION COMPLETE' || label === 'TASK COMPLETED') return 'text-success'
  return 'text-text-secondary'
}

export function FocusModeHeader({
  workflow,
  focusRunning,
  focusPaused,
  sessionComplete,
}: FocusModeHeaderProps) {
  const status = focusStatusLabel(workflow, focusRunning, focusPaused, sessionComplete)

  return (
    <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
      <header className="animate-fade-up min-w-0 shrink-0" style={{ animationDelay: '0.05s' }}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-tight tracking-tight text-white">
              Focus Mode
            </h1>
            <Target
              className="h-5 w-5 text-[#25C8FF] drop-shadow-[0_0_8px_rgba(37,200,255,0.45)]"
              strokeWidth={2}
              aria-hidden
            />
          </div>
          <p
            className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusTone(status)}`}
            role="status"
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"
              aria-hidden
            />
            {status}
          </p>
        </div>
        <p className="mt-2 max-w-xl text-[15px] text-text-secondary">
          One task. One timer. One goal.
        </p>
      </header>
      <Link
        to="/dashboard"
        className="text-sm font-medium text-text-muted transition-colors hover:text-text-secondary"
      >
        Exit Focus Mode
      </Link>
    </div>
  )
}
