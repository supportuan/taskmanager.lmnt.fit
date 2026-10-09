import type { ReactNode } from 'react'
import { Clock, Flag, Grid2X2 } from 'lucide-react'
import type { TrackerTask } from '../../types/tracker'
import { priorityAccent } from '../../types/tracker'
import { formatDisplayDate, formatDuration } from '../../utils/dateUtils'
import { formatScheduledResumeDisplay } from '../../utils/tracker/scheduledResumeUtils'
import { formatTimer, remainingFromElapsed } from '../../utils/trackerUtils'
import { ProgressBar } from '../common/ProgressBar'
import { GlassCard } from '../layout/GlassCard'

interface CurrentTaskCardProps {
  task: TrackerTask | undefined
  displayElapsed: number
  displayProgress: number
  footer?: ReactNode
}

export function CurrentTaskCard({
  task,
  displayElapsed,
  displayProgress,
  footer,
}: CurrentTaskCardProps) {
  if (!task) {
    return (
      <GlassCard tier="accent" className="p-6" glow="blue">
        <p className="text-text-muted">No tasks scheduled for this day.</p>
      </GlassCard>
    )
  }

  const remaining = remainingFromElapsed(task.durationMinutes, displayElapsed)
  const accent = task.accentColor
  const isRunning = task.workflowStatus === 'in_progress'
  const isPaused = task.workflowStatus === 'paused'

  return (
    <GlassCard
      tier="accent"
      className="tracker-current-task relative overflow-hidden p-6"
      glow="blue"
      style={{ animationDelay: '0.08s' }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-30 blur-3xl"
        style={{ background: accent }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 opacity-20"
        style={{
          background: `linear-gradient(90deg, ${accent}00, ${accent}44, #7B4DFF33)`,
        }}
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:gap-6">
        <div
          className="w-1 shrink-0 rounded-full"
          style={{
            background: `linear-gradient(180deg, ${accent}, #C45CFF)`,
            boxShadow: `0 0 16px ${accent}55, 0 0 28px rgba(123,77,255,0.15)`,
          }}
          aria-hidden
        />

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-cyan">
            Current Task
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white lg:text-[1.65rem]">
            {task.title}
          </h2>

          <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5">
              <Flag className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
              <dt className="sr-only">Priority</dt>
              <dd
                className="font-medium capitalize"
                style={{ color: priorityAccent(task.priority) }}
              >
                {task.priority} Priority
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Grid2X2 className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
              <dt className="sr-only">Category</dt>
              <dd className="text-text-main">{task.category}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
              <dd className="text-text-secondary">
                {task.startTime} – {task.endTime} · {formatDuration(task.durationMinutes)}
              </dd>
            </div>
          </dl>

          <p className="mt-1 text-xs text-text-muted">{formatDisplayDate(task.date)}</p>

          {task.description && (
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{task.description}</p>
          )}

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-text-secondary">Progress</span>
              <span className="font-semibold tabular-nums text-text-main">{displayProgress}%</span>
            </div>
            <ProgressBar value={displayProgress} className="h-2" />
            <p className="mt-2 text-xs tabular-nums text-text-muted">
              Planned {formatDuration(task.durationMinutes)} · {formatTimer(remaining)} remaining
            </p>
          </div>

          {isPaused && task.pauseReason ? (
            <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-text-secondary">
              <span className="font-medium text-text-main">Paused:</span> {task.pauseReason}
            </p>
          ) : null}
          {isPaused && task.scheduledResumeAt ? (
            <p className="mt-2 text-xs text-text-muted">
              Planned resume: {formatScheduledResumeDisplay(task.scheduledResumeAt)}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center lg:w-36">
          <div
            className={[
              'tracker-timer-ring relative flex h-28 w-28 items-center justify-center rounded-full border bg-white/[0.04]',
              isRunning
                ? 'border-[rgba(52,175,255,0.55)] shadow-[0_0_28px_rgba(37,200,255,0.28)]'
                : 'border-[rgba(52,175,255,0.35)] shadow-[0_0_24px_rgba(37,200,255,0.15)]',
            ].join(' ')}
          >
            <span className="text-2xl font-semibold tabular-nums text-white">
              {formatTimer(displayElapsed)}
            </span>
          </div>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-text-muted">
            {isRunning ? 'Elapsed' : isPaused ? 'Worked' : 'Elapsed'}
          </p>
          {!isRunning && !isPaused ? (
            <p className="mt-1 text-[10px] text-text-muted">Start to track time</p>
          ) : null}
        </div>
      </div>

      {footer}
    </GlassCard>
  )
}
