import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Dumbbell,
  GitPullRequest,
  Palette,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMemo } from 'react'
import type { TrackerTask } from '../../types/tracker'
import {
  formatDisplayDate,
  formatDuration,
  formatISODate,
  formatTime,
} from '../../utils/dateUtils'
import { ProgressBar } from '../common/ProgressBar'
import { GlassCard } from '../layout/GlassCard'

const taskIcons: Record<string, LucideIcon> = {
  Health: Dumbbell,
  Development: Code2,
  Work: Users,
  Design: Palette,
  Learning: BookOpen,
  Study: BookOpen,
  Meeting: Users,
}

function getTaskIcon(task: TrackerTask): LucideIcon {
  return taskIcons[task.category] ?? GitPullRequest
}

function statusLabel(task: TrackerTask): string {
  if (task.workflowStatus === 'completed') return 'Completed'
  if (task.workflowStatus === 'in_progress' || task.status === 'current') return 'Current'
  if (task.workflowStatus === 'paused') return 'Paused'
  return 'Upcoming'
}

interface TimelineCardProps {
  selectedIso: string
  tasks: TrackerTask[]
  currentTaskId: number | undefined
  currentProgress: number
  now: Date
  onPrevDay: () => void
  onNextDay: () => void
  onToday: () => void
  onSelectTask: (id: number) => void
}

export function TimelineCard({
  selectedIso,
  tasks,
  currentTaskId,
  currentProgress,
  now,
  onPrevDay,
  onNextDay,
  onToday,
  onSelectTask,
}: TimelineCardProps) {
  const isToday = selectedIso === formatISODate(now)

  const nowInsertIndex = useMemo(() => {
    if (!isToday) return -1
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].workflowStatus !== 'completed') return i
    }
    return tasks.length
  }, [tasks, isToday])

  return (
    <GlassCard tier="main" className="flex h-full flex-col p-6" style={{ animationDelay: '0.16s' }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-main">
            Today&apos;s Timeline
          </h2>
          <p className="text-xs text-text-muted">{formatDisplayDate(selectedIso)}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevDay}
            className="calendar-nav-btn flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToday}
            className={[
              'rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all',
              isToday ? 'segment-tab-active' : 'text-text-muted hover:text-text-secondary',
            ].join(' ')}
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNextDay}
            className="calendar-nav-btn flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary"
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5">
        <div
          className="absolute bottom-2 left-[52px] top-2 w-px bg-gradient-to-b from-primary-cyan/60 via-primary-blue/25 to-transparent"
          aria-hidden
        />

        {tasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">No tasks on this day.</p>
        ) : (
          tasks.map((task, index) => {
            const Icon = getTaskIcon(task)
            const isCurrent =
              task.id === currentTaskId ||
              task.workflowStatus === 'in_progress' ||
              task.status === 'current'
            const isCompleted = task.workflowStatus === 'completed'
            const showNow = isToday && index === nowInsertIndex

            const rowState = isCurrent
              ? 'schedule-row-current'
              : 'schedule-row'

            const dotClass = isCompleted
              ? 'timeline-dot-completed'
              : isCurrent
                ? 'timeline-dot-current'
                : 'timeline-dot-upcoming'

            return (
              <div key={task.id}>
                {showNow && (
                  <div
                    className="mb-2 flex items-center gap-2 pl-[52px] text-[11px] font-semibold text-primary-cyan"
                    aria-live="polite"
                  >
                    <span className="h-px flex-1 bg-primary-cyan/40" />
                    NOW · {formatTime(now)}
                    <span className="h-px flex-1 bg-primary-cyan/40" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => onSelectTask(task.id)}
                  className={[
                    'group relative grid w-full grid-cols-[72px_1fr_auto] items-center gap-3 rounded-xl px-2 py-3 text-left',
                    rowState,
                    isCompleted && 'opacity-70',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'text-xs font-medium tabular-nums',
                      isCurrent ? 'schedule-time-current' : 'text-text-muted',
                    ].join(' ')}
                  >
                    {task.startTime}
                  </span>

                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-navy/80',
                        dotClass,
                      ].join(' ')}
                      style={{
                        background: `${task.accentColor}22`,
                      }}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4 text-success" strokeWidth={2.5} />
                      ) : (
                        <Icon
                          className="h-4 w-4"
                          style={{
                            color: isCurrent ? '#25C8FF' : task.accentColor,
                            filter: isCurrent
                              ? 'drop-shadow(0 0 6px rgba(37,200,255,0.5))'
                              : undefined,
                          }}
                          strokeWidth={isCurrent ? 2.25 : 1.75}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={[
                          'truncate text-sm font-medium',
                          isCurrent ? 'text-white' : 'text-text-main',
                        ].join(' ')}
                      >
                        {task.title}
                      </p>
                      {isCurrent && (
                        <ProgressBar value={currentProgress} className="mt-2 max-w-[140px]" />
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-text-muted">{formatDuration(task.durationMinutes)}</p>
                    <p
                      className={[
                        'text-[11px] font-medium',
                        isCompleted && 'text-success/90',
                        isCurrent && 'text-primary-cyan',
                        !isCompleted && !isCurrent && 'text-text-muted',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {statusLabel(task)}
                    </p>
                  </div>
                </button>
              </div>
            )
          })
        )}
      </div>
    </GlassCard>
  )
}
