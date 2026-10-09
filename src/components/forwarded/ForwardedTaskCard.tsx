import { CheckCircle2 } from 'lucide-react'
import type { Task } from '../../types/task'
import { formatDisplayDate, formatDuration } from '../../utils/dateUtils'
import { forwardedStatusLabel } from '../../utils/forwarded/forwardedTaskUtils'
import { Button } from '../common/Button'
import { GlassCard } from '../layout/GlassCard'

interface ForwardedTaskCardProps {
  task: Task
  completing: boolean
  onComplete: (task: Task) => void
}

function priorityLabel(priority: Task['priority']): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

export function ForwardedTaskCard({ task, completing, onComplete }: ForwardedTaskCardProps) {
  const description = task.description.trim()

  return (
    <GlassCard tier="main" className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-text-main sm:text-lg">
              {task.title}
            </h2>
            {description ? (
              <div className="mt-2">
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Description
                </p>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">{description}</p>
              </div>
            ) : null}
          </div>

          <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Priority
              </dt>
              <dd className="mt-0.5 font-medium capitalize" style={{ color: task.accentColor }}>
                {priorityLabel(task.priority)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">Date</dt>
              <dd className="mt-0.5 text-text-secondary">{formatDisplayDate(task.date)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">Time</dt>
              <dd className="mt-0.5 text-text-secondary">
                {task.startTime} – {task.endTime}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Planned
              </dt>
              <dd className="mt-0.5 text-text-secondary">
                {formatDuration(task.durationMinutes)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Status
              </dt>
              <dd className="mt-0.5 font-medium text-text-main">
                {forwardedStatusLabel(task.status)}
              </dd>
            </div>
            {task.category ? (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Category
                </dt>
                <dd className="mt-0.5 text-text-secondary">{task.category}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="flex shrink-0 justify-end lg:pt-1">
          <Button
            type="button"
            variant="primary"
            disabled={completing}
            onClick={() => onComplete(task)}
            className="inline-flex min-w-[9.5rem] items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} aria-hidden />
            {completing ? 'Completing…' : 'Completed'}
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}
