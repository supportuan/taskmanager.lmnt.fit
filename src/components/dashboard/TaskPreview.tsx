import { Clock, Flag, Grid2X2, Play } from 'lucide-react'
import type { Task } from '../../types/task'
import { formatDisplayDate, formatDuration } from '../../utils/dateUtils'
import { Button } from '../common/Button'
import { GlassCard } from '../layout/GlassCard'

interface TaskPreviewProps {
  task: Task | undefined
  hasTasks: boolean
  onStartTask: (id: number) => void
}

function priorityColor(priority: Task['priority']): string {
  switch (priority) {
    case 'high':
      return '#FF5C70'
    case 'medium':
      return '#F5B544'
    default:
      return '#25C8FF'
  }
}

export function TaskPreview({ task, hasTasks, onStartTask }: TaskPreviewProps) {
  if (!task) {
    return (
      <GlassCard className="p-6" style={{ animationDelay: '0.25s' }}>
        <h2 className="mb-2 text-lg font-semibold text-text-main">Task Preview</h2>
        <p className="text-text-muted">
          {hasTasks ? 'Select a task to preview.' : 'No tasks yet.'}
        </p>
      </GlassCard>
    )
  }

  const accent = task.accentColor

  return (
    <GlassCard
      tier="accent"
      className="relative overflow-hidden p-6"
      glow="blue"
      style={{ animationDelay: '0.25s' }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-30 blur-3xl"
        style={{ background: accent }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 opacity-20"
        style={{
          background: `linear-gradient(90deg, ${accent}00, ${accent}44, #7B4DFF33)`,
        }}
      />

      <div className="relative flex gap-4">
        <div
          className="w-1 shrink-0 rounded-full"
          style={{
            background: `linear-gradient(180deg, ${accent}, #C45CFF)`,
            boxShadow: `0 0 16px ${accent}55, 0 0 28px rgba(123,77,255,0.15)`,
          }}
          aria-hidden
        />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-start justify-between gap-2">
            <h2 className="text-lg font-semibold text-text-main">Task Preview</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              Live Preview
            </span>
          </div>

          <h3 className="text-xl font-semibold text-text-main">{task.title}</h3>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
              <dt className="text-text-muted">Priority:</dt>
              <dd
                className="font-medium capitalize"
                style={{ color: priorityColor(task.priority) }}
              >
                {task.priority}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Grid2X2 className="h-4 w-4 text-text-muted" strokeWidth={1.75} />
              <dt className="text-text-muted">Category:</dt>
              <dd className="font-medium text-text-main">{task.category}</dd>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-text-muted" strokeWidth={1.75} />
              <div>
                <p>
                  <span className="text-text-muted">Date: </span>
                  <span className="text-text-main">{formatDisplayDate(task.date)}</span>
                </p>
                <p className="mt-1">
                  <span className="text-text-muted">Time: </span>
                  <span className="text-text-main">
                    {task.startTime} – {task.endTime}
                  </span>
                </p>
                <p className="mt-1">
                  <span className="text-text-muted">Duration: </span>
                  <span className="text-text-main">{formatDuration(task.durationMinutes)}</span>
                </p>
              </div>
            </div>
          </dl>

          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            &ldquo;{task.description}&rdquo;
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>

          <Button
            className="mt-6 w-full sm:w-auto"
            onClick={() => onStartTask(task.id)}
            disabled={task.status === 'completed'}
          >
            <Play className="h-4 w-4 fill-current" strokeWidth={0} />
            {task.status === 'current' ? 'In Progress' : 'Start Task'}
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}
