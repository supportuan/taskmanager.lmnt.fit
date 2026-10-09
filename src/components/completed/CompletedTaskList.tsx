import { Check, ChevronDown, Trophy } from 'lucide-react'
import type { TrackerTask } from '../../types/tracker'
import type { CompletedDateFilter } from '../../utils/completedMetrics'
import { priorityAccent } from '../../types/tracker'
import { formatCompletionTimestamp, formatDuration } from '../../utils/dateUtils'
import { GlassCard } from '../layout/GlassCard'

const FILTERS: { id: CompletedDateFilter; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All' },
]

interface CompletedTaskListProps {
  tasks: TrackerTask[]
  selectedId: number | undefined
  dateFilter: CompletedDateFilter
  onDateFilterChange: (f: CompletedDateFilter) => void
  onSelect: (id: number) => void
}

export function CompletedTaskList({
  tasks,
  selectedId,
  dateFilter,
  onDateFilterChange,
  onSelect,
}: CompletedTaskListProps) {
  return (
    <GlassCard tier="main" className="flex min-h-0 flex-col p-6" style={{ animationDelay: '0.08s' }}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-main">Completed Tasks</h2>
          <p className="text-xs text-text-muted">Your finished work</p>
        </div>
        <div
          className="flex rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md"
          role="tablist"
          aria-label="Completed date filter"
        >
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={dateFilter === id}
              onClick={() => onDateFilterChange(id)}
              className={[
                'rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-[220ms] sm:px-3 sm:text-xs',
                dateFilter === id
                  ? 'segment-tab-active'
                  : 'text-text-muted hover:text-text-secondary',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="completed-task-list flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
        {tasks.length === 0 ? (
          <li className="py-10 text-center text-sm text-text-muted">No tasks match this filter.</li>
        ) : (
          tasks.map((task) => {
            const selected = task.id === selectedId
            const actual = task.actualDurationMinutes ?? Math.round(task.elapsedSeconds / 60)
            const expanded = selected
            return (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onSelect(task.id)}
                  aria-expanded={expanded}
                  className={[
                    'completed-task-item group w-full rounded-xl border px-3 py-3 text-left transition-all duration-[220ms] sm:px-4',
                    selected
                      ? 'schedule-row-current border-[rgba(52,175,255,0.55)]'
                      : 'schedule-row border-transparent',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success shadow-[0_0_12px_rgba(45,212,163,0.2)]"
                      aria-hidden
                    >
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-white">{task.title}</p>
                        <ChevronDown
                          className={[
                            'h-4 w-4 shrink-0 text-text-muted transition-transform duration-200',
                            expanded ? 'rotate-180' : '',
                          ].join(' ')}
                          aria-hidden
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-text-muted">
                        {task.completedAt
                          ? formatCompletionTimestamp(task.completedAt)
                          : `Completed · ${task.date}`}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-secondary">
                        <span>Planned {formatDuration(task.durationMinutes)}</span>
                        <span>Actual {formatDuration(actual)}</span>
                        <span style={{ color: priorityAccent(task.priority) }}>
                          {task.priority} · {task.category}
                        </span>
                      </div>
                      {expanded && task.description && (
                        <p className="completed-task-expand mt-3 text-sm leading-relaxed text-text-secondary">
                          {task.description}
                        </p>
                      )}
                      {expanded && task.achievement && (
                        <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-warning/90">
                          <Trophy className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                          {task.achievement}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            )
          })
        )}
      </ul>
    </GlassCard>
  )
}
