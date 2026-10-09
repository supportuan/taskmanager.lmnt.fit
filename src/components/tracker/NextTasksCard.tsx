import { formatDuration } from '../../utils/dateUtils'
import type { TrackerTask } from '../../types/tracker'
import { priorityAccent } from '../../types/tracker'
import { GlassCard } from '../layout/GlassCard'

interface NextTasksCardProps {
  tasks: TrackerTask[]
  currentTaskId: number | undefined
  onSelect: (id: number) => void
  draggable?: boolean
}

export function NextTasksCard({
  tasks,
  currentTaskId,
  onSelect,
  draggable = false,
}: NextTasksCardProps) {
  return (
    <GlassCard tier="main" className="flex h-full flex-col p-6" style={{ animationDelay: '0.12s' }}>
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight text-text-main">Next 6 Tasks</h2>
        <p className="text-xs text-text-muted">What&apos;s coming up</p>
      </div>

      <ol className="flex flex-1 flex-col gap-2">
        {tasks.length === 0 ? (
          <li className="py-6 text-center text-sm text-text-muted">No upcoming tasks.</li>
        ) : (
          tasks.map((task, index) => {
            const isCurrent = task.id === currentTaskId
            const isCompleted = task.workflowStatus === 'completed'
            return (
              <li key={task.id}>
                <button
                  type="button"
                  draggable={draggable && !isCompleted}
                  onDragStart={(event) => {
                    if (!draggable || isCompleted) return
                    event.dataTransfer.setData('application/x-taskflow-task-id', String(task.id))
                    event.dataTransfer.effectAllowed = 'move'
                  }}
                  onClick={() => onSelect(task.id)}
                  className={[
                    'tracker-next-item group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-[220ms]',
                    isCurrent
                      ? 'schedule-row-current border-[rgba(52,175,255,0.55)]'
                      : 'schedule-row border-transparent',
                    isCompleted && 'opacity-60',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold',
                      isCurrent
                        ? 'bg-primary-cyan/20 text-primary-cyan'
                        : 'bg-white/[0.06] text-text-muted',
                    ].join(' ')}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={[
                        'truncate text-sm font-medium',
                        isCurrent ? 'text-white' : 'text-text-main',
                      ].join(' ')}
                    >
                      {task.title}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {task.startTime} · {formatDuration(task.durationMinutes)} ·{' '}
                      <span style={{ color: priorityAccent(task.priority) }}>{task.category}</span>
                    </p>
                  </div>
                </button>
              </li>
            )
          })
        )}
      </ol>
    </GlassCard>
  )
}
