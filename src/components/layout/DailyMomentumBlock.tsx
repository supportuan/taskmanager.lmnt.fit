import { Sprout } from 'lucide-react'
import { useMemo } from 'react'
import { useTaskFlow } from '../../context/TaskFlowContext'
import { formatISODate } from '../../utils/dateUtils'
import { tasksForDate } from '../../utils/trackerUtils'
import { ProgressBar } from '../common/ProgressBar'

interface DailyMomentumBlockProps {
  showFooterLink?: boolean
  className?: string
}

function todayCompletionPercent(tasks: ReturnType<typeof useTaskFlow>['tasks']): number {
  const todayIso = formatISODate(new Date())
  const todayTasks = tasksForDate(tasks, todayIso)
  if (todayTasks.length === 0) return 0
  const completed = todayTasks.filter((t) => t.workflowStatus === 'completed').length
  return Math.min(100, Math.max(0, Math.round((completed / todayTasks.length) * 100)))
}

export function DailyMomentumBlock({ showFooterLink = true, className = '' }: DailyMomentumBlockProps) {
  const { tasks } = useTaskFlow()
  const momentumPercent = useMemo(() => todayCompletionPercent(tasks), [tasks])

  return (
    <div className={`relative z-[1] -mt-[5px] shrink-0 ${className}`}>
      <div className="sidebar-momentum-card rounded-2xl border border-white/12 p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-success">
            <Sprout className="h-4 w-4" strokeWidth={2} />
            <span className="text-xs font-medium text-text-secondary">Daily momentum</span>
          </div>
          <span className="text-xs font-medium tabular-nums text-text-muted">
            {momentumPercent}%
          </span>
        </div>
        <p className="text-sm leading-snug text-text-main">
          Small steps.
          <br />
          <span className="text-text-secondary">Create big results.</span>
        </p>
        <ProgressBar value={momentumPercent} className="mt-3" />
      </div>
      {showFooterLink ? (
        <a
          href="https://www.auntechconsulting.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-center text-[10px] leading-snug text-text-muted transition-colors hover:text-primary-cyan sm:text-[11px]"
        >
          D&amp;D © 2026 AUNtech V1.1
        </a>
      ) : null}
    </div>
  )
}
