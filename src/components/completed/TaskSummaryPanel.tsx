import { Flag, Grid2X2, RotateCcw, Tag, Trophy } from 'lucide-react'
import type { TrackerTask } from '../../types/tracker'
import { priorityAccent } from '../../types/tracker'
import { efficiencyLabel, type TimePerformanceMetrics } from '../../utils/completedMetrics'
import { formatCompletionTimestamp, formatDuration } from '../../utils/dateUtils'
import { Button } from '../common/Button'
import { GlassCard } from '../layout/GlassCard'

interface TaskSummaryPanelProps {
  task: TrackerTask | undefined
  performance: TimePerformanceMetrics
  onMarkNotCompleted?: () => void
  markNotCompletedBusy?: boolean
}

export function TaskSummaryPanel({
  task,
  performance,
  onMarkNotCompleted,
  markNotCompletedBusy = false,
}: TaskSummaryPanelProps) {
  if (!task) {
    return (
      <GlassCard tier="secondary" className="p-6" style={{ animationDelay: '0.2s' }}>
        <p className="text-sm text-text-muted">Select a completed task to view your reflection.</p>
      </GlassCard>
    )
  }

  const actual = task.actualDurationMinutes ?? Math.round(task.elapsedSeconds / 60)
  const efficiency = efficiencyLabel(task.durationMinutes, actual)

  return (
    <GlassCard tier="main" className="p-6" style={{ animationDelay: '0.2s' }}>
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-text-main">Task Summary</h2>
        <p className="text-xs text-text-muted">Your reflection · {task.title}</p>
      </div>

      <dl className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Meta label="Planned" value={formatDuration(task.durationMinutes)} />
        <Meta label="Actual" value={formatDuration(actual)} />
        <Meta label="Category" value={task.category} icon={Grid2X2} />
        <Meta
          label="Priority"
          value={task.priority}
          icon={Flag}
          valueColor={priorityAccent(task.priority)}
        />
      </dl>

      {task.completedAt && (
        <p className="mb-4 text-xs text-text-muted">
          {formatCompletionTimestamp(task.completedAt)}
        </p>
      )}

      {efficiency && (
        <p className="mb-4 text-sm font-medium text-primary-cyan">{efficiency}</p>
      )}

      {(task.completionSummary || task.achievement || task.reflectionNote) && (
        <div className="space-y-4">
          {task.completionSummary ? (
            <SummaryBlock title="Summary" text={task.completionSummary} />
          ) : null}
          {task.achievement ? (
            <SummaryBlock
              title="Achievement"
              text={task.achievement}
              variant="achievement"
              icon={Trophy}
            />
          ) : null}
          {task.reflectionNote ? (
            <SummaryBlock title="Notes for next time" text={task.reflectionNote} />
          ) : null}
        </div>
      )}

      {task.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {onMarkNotCompleted ? (
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-4">
          <Button
            type="button"
            variant="ghost"
            className="px-3 py-2 text-xs font-medium"
            disabled={markNotCompletedBusy}
            onClick={onMarkNotCompleted}
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {markNotCompletedBusy ? 'Updating…' : 'Not Completed'}
          </Button>
        </div>
      ) : null}

      {performance.totalCompleted === 0 && (
        <p className="mt-4 text-xs text-text-muted">Complete tasks in Task Tracker to build history.</p>
      )}
    </GlassCard>
  )
}

function Meta({
  label,
  value,
  icon: Icon,
  valueColor,
}: {
  label: string
  value: string
  icon?: typeof Flag
  valueColor?: string
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
      <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        {Icon && <Icon className="h-3 w-3" strokeWidth={1.75} />}
        {label}
      </dt>
      <dd
        className="mt-1 text-sm font-medium capitalize text-text-main"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </dd>
    </div>
  )
}

function SummaryBlock({
  title,
  text,
  variant,
  icon: Icon,
}: {
  title: string
  text?: string
  variant?: 'achievement'
  icon?: typeof Trophy
}) {
  if (!text) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</p>
        <p className="mt-2 text-sm italic text-text-muted">No reflection saved for this task.</p>
      </div>
    )
  }

  return (
    <div
      className={[
        'rounded-xl border px-4 py-3',
        variant === 'achievement'
          ? 'border-[rgba(245,181,68,0.25)] bg-[rgba(245,181,68,0.06)] shadow-[0_0_16px_rgba(245,181,68,0.08)]'
          : 'border-white/10 bg-white/[0.03]',
      ].join(' ')}
    >
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
        {Icon && <Icon className="h-3.5 w-3.5 text-warning" strokeWidth={1.75} />}
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-text-main">{text}</p>
    </div>
  )
}
