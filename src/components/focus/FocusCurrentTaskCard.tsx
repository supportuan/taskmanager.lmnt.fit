import { Clock, Flag, Grid2X2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { TrackerTask, TrackerWorkflowStatus } from '../../types/tracker'
import { priorityAccent } from '../../types/tracker'
import { formatDuration } from '../../utils/dateUtils'
import { QuickControls } from '../tracker/QuickControls'
import { Button } from '../common/Button'
import { GlassCard } from '../layout/GlassCard'

function workflowBadge(status: TrackerWorkflowStatus | undefined): {
  label: string
  className: string
} {
  switch (status) {
    case 'in_progress':
      return { label: 'In progress', className: 'text-primary-cyan border-primary-cyan/30 bg-primary-cyan/10' }
    case 'paused':
      return { label: 'Paused', className: 'text-warning border-warning/30 bg-warning/10' }
    case 'completed':
      return { label: 'Completed', className: 'text-success border-success/30 bg-success/10' }
    default:
      return { label: 'Not started', className: 'text-text-muted border-white/10 bg-white/[0.04]' }
  }
}

interface FocusCurrentTaskCardProps {
  task: TrackerTask | undefined
  emptyList?: boolean
  disabled?: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onComplete: () => void
}

export function FocusCurrentTaskCard({
  task,
  emptyList = false,
  disabled = false,
  onStart,
  onPause,
  onResume,
  onComplete,
}: FocusCurrentTaskCardProps) {
  if (!task) {
    return (
      <GlassCard tier="main" className="flex flex-col items-center px-6 py-12 text-center" animate>
        <p className="text-lg font-semibold text-text-main">
          {emptyList ? 'No open tasks' : 'No task selected'}
        </p>
        <p className="mt-2 max-w-md text-sm text-text-secondary">
          {emptyList
            ? 'Add a task or complete your schedule to start focusing.'
            : 'Open Task Tracker to pick up your next task.'}
        </p>
        <Link to={emptyList ? '/add-task' : '/tracker'} className="mt-6">
          <Button type="button">{emptyList ? 'Add a task' : 'Go to Task Tracker'}</Button>
        </Link>
      </GlassCard>
    )
  }

  const badge = workflowBadge(task.workflowStatus)
  const accent = task.accentColor

  return (
    <GlassCard
      tier="accent"
      glow="blue"
      className="focus-current-task relative overflow-hidden p-6 lg:p-7"
      style={{ animationDelay: '0.1s' }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full opacity-25 blur-3xl"
        style={{ background: accent }}
        aria-hidden
      />
      <p className="text-xs font-semibold uppercase tracking-wider text-primary-cyan">
        Current Task
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-2xl font-semibold leading-tight text-white lg:text-[1.85rem]">
          {task.title}
        </h2>
        <span
          className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <Grid2X2 className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
          {task.category}
        </span>
        <span
          className="inline-flex items-center gap-1.5 font-medium capitalize"
          style={{ color: priorityAccent(task.priority) }}
        >
          <Flag className="h-3.5 w-3.5 opacity-80" strokeWidth={1.75} />
          {task.priority} priority
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
          {task.startTime} — {task.endTime}
        </span>
      </div>
      <p className="mt-1 text-xs text-text-muted">{formatDuration(task.durationMinutes)} planned</p>
      {task.description ? (
        <p className="mt-4 text-sm leading-relaxed text-text-secondary">&ldquo;{task.description}&rdquo;</p>
      ) : null}
      <QuickControls
        embedded
        task={task}
        disabled={disabled}
        showSkip={false}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onComplete={onComplete}
      />
    </GlassCard>
  )
}
