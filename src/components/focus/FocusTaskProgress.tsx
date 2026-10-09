import { Activity } from 'lucide-react'
import { formatDuration, formatTimeWorked } from '../../utils/dateUtils'
import { formatTimer } from '../../utils/trackerUtils'
import { ProgressBar } from '../common/ProgressBar'
import { GlassCard } from '../layout/GlassCard'

interface FocusTaskProgressProps {
  progress: number
  elapsedSeconds: number
  plannedMinutes: number
  remainingSeconds: number
  hasTask: boolean
}

export function FocusTaskProgress({
  progress,
  elapsedSeconds,
  plannedMinutes,
  remainingSeconds,
  hasTask,
}: FocusTaskProgressProps) {
  if (!hasTask) {
    return (
      <GlassCard tier="secondary" className="p-5 text-sm text-text-muted">
        Task progress will appear when a current task is available.
      </GlassCard>
    )
  }

  const workedMinutes = Math.floor(elapsedSeconds / 60)
  const overPlan = plannedMinutes > 0 && elapsedSeconds > plannedMinutes * 60

  return (
    <GlassCard tier="main" className="p-5 lg:p-6" style={{ animationDelay: '0.16s' }}>
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary-cyan" strokeWidth={2} />
        <h2 className="text-base font-semibold text-text-main">Task progress</h2>
      </div>
      <div className="mb-2 flex items-end justify-between">
        <span className="text-3xl font-semibold tabular-nums text-white">{progress}%</span>
        <span className="text-xs text-text-muted">Estimated from time on task</span>
      </div>
      <ProgressBar value={progress} className="h-2.5" />
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-muted">Time worked</dt>
          <dd className="mt-0.5 font-medium tabular-nums text-text-main">
            {workedMinutes < 60 ? formatDuration(workedMinutes) : formatTimeWorked(workedMinutes)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-muted">Planned</dt>
          <dd className="mt-0.5 font-medium text-text-main">{formatDuration(plannedMinutes)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs uppercase tracking-wide text-text-muted">Remaining</dt>
          <dd className={`mt-0.5 font-medium tabular-nums ${overPlan ? 'text-warning' : 'text-text-main'}`}>
            {overPlan
              ? 'Over planned time'
              : `${formatTimer(remainingSeconds)} estimated`}
          </dd>
        </div>
      </dl>
    </GlassCard>
  )
}
