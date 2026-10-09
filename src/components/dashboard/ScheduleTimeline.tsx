import {
  BookOpen,
  Check,
  Code2,
  Dumbbell,
  GitPullRequest,
  Palette,
  Plus,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ScheduleViewMode, Task } from '../../types/task'
import { formatDuration, formatScheduleHeading } from '../../utils/dateUtils'
import { ProgressBar } from '../common/ProgressBar'
import { GlassCard } from '../layout/GlassCard'

const taskIcons: Record<string, LucideIcon> = {
  Health: Dumbbell,
  Development: Code2,
  Work: Users,
  Design: Palette,
  Learning: BookOpen,
}

function getTaskIcon(task: Task): LucideIcon {
  return taskIcons[task.category] ?? GitPullRequest
}

function statusLabel(task: Task): string {
  if (task.status === 'completed') return 'Completed'
  if (task.status === 'current' || task.status === 'in_progress') return 'Current'
  return 'Upcoming'
}

interface ScheduleTimelineProps {
  items: Task[]
  selectedTaskId: number | undefined
  selectedDateIso: string
  isSelectedToday: boolean
  scheduleMode: ScheduleViewMode
  onScheduleModeChange: (mode: ScheduleViewMode) => void
  onSelectTask: (id: number) => void
}

export function ScheduleTimeline({
  items,
  selectedTaskId,
  selectedDateIso,
  isSelectedToday,
  scheduleMode,
  onScheduleModeChange,
  onSelectTask,
}: ScheduleTimelineProps) {
  const navigate = useNavigate()
  const heading = formatScheduleHeading(selectedDateIso)
  const subtitle =
    isSelectedToday && scheduleMode === 'hours' ? 'Next 6 hours' : 'Next 6 tasks'

  const emptyMessage = isSelectedToday
    ? 'No tasks in this window. Select another day or add a task.'
    : 'No tasks scheduled for this day.'

  const goToAddTask = () => {
    navigate(`/add-task?date=${encodeURIComponent(selectedDateIso)}`)
  }

  return (
    <GlassCard tier="main" className="flex flex-col p-6" style={{ animationDelay: '0.2s' }}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-main">{heading}</h2>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md"
            role="tablist"
            aria-label="Schedule view"
          >
            {isSelectedToday ? (
              <button
                type="button"
                role="tab"
                aria-selected={scheduleMode === 'hours'}
                onClick={() => onScheduleModeChange('hours')}
                className={[
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-[220ms]',
                  scheduleMode === 'hours'
                    ? 'segment-tab-active'
                    : 'text-text-muted hover:text-text-secondary',
                ].join(' ')}
              >
                Next 6 Hours
              </button>
            ) : null}
            <button
              type="button"
              role="tab"
              aria-selected={isSelectedToday ? scheduleMode === 'tasks' : true}
              onClick={() => onScheduleModeChange('tasks')}
              className={[
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-[220ms]',
                (isSelectedToday && scheduleMode === 'tasks') || !isSelectedToday
                  ? 'segment-tab-active'
                  : 'text-text-muted hover:text-text-secondary',
              ].join(' ')}
            >
              Next 6 Tasks
            </button>
            {!isSelectedToday ? (
              <button
                type="button"
                onClick={goToAddTask}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted transition-all duration-[220ms] hover:text-text-secondary"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Add New Task
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className="text-xs font-medium text-primary-cyan transition-colors duration-200 hover:text-primary-blue hover:drop-shadow-[0_0_8px_rgba(37,200,255,0.35)]"
          >
            View All
          </button>
        </div>
      </div>

      <div className="relative flex-1 space-y-1">
        <div
          className="absolute bottom-2 left-[52px] top-2 w-px bg-gradient-to-b from-primary-cyan/60 via-primary-blue/25 to-transparent"
          aria-hidden
        />

        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">{emptyMessage}</p>
        ) : (
          items.map((task) => {
            const Icon = getTaskIcon(task)
            const isSelected = task.id === selectedTaskId
            const isCompleted = task.status === 'completed'
            const isCurrent = task.status === 'current' || task.status === 'in_progress'

            const rowState = isCurrent
              ? 'schedule-row-current'
              : isSelected
                ? 'schedule-row-selected'
                : 'schedule-row'

            const dotClass = isCompleted
              ? 'timeline-dot-completed'
              : isCurrent
                ? 'timeline-dot-current'
                : 'timeline-dot-upcoming'

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onSelectTask(task.id)}
                className={[
                  'group relative grid w-full grid-cols-[72px_1fr_auto] items-center gap-3 rounded-xl px-2 py-3 text-left',
                  rowState,
                  isCompleted && 'opacity-70',
                ]
                  .filter(Boolean)
                  .join(' ')}
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
                      <ProgressBar
                        value={Math.min(100, Math.max(0, task.progressPercent ?? 0))}
                        className="mt-2 max-w-[140px]"
                      />
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
            )
          })
        )}
      </div>
    </GlassCard>
  )
}
