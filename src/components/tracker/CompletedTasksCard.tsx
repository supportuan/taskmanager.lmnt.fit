import { useState } from 'react'
import { formatDuration } from '../../utils/dateUtils'
import type { TrackerTask } from '../../types/tracker'
import { priorityAccent } from '../../types/tracker'
import { GlassCard } from '../layout/GlassCard'

interface CompletedTasksCardProps {
  tasks: TrackerTask[]
  onDropTaskId: (taskId: number) => void
  isCompleting?: boolean
}

export function CompletedTasksCard({
  tasks,
  onDropTaskId,
  isCompleting = false,
}: CompletedTasksCardProps) {
  const [dragOver, setDragOver] = useState(false)

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }

  const onDragLeave = () => setDragOver(false)

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    const raw = event.dataTransfer.getData('application/x-taskflow-task-id')
    const id = Number.parseInt(raw, 10)
    if (Number.isFinite(id) && id > 0) onDropTaskId(id)
  }

  return (
    <GlassCard
      tier="main"
      className={[
        'flex h-full min-h-[280px] flex-col p-6 transition-all duration-[220ms]',
        dragOver ? 'ring-2 ring-[rgba(52,175,255,0.55)] ring-offset-0' : '',
      ].join(' ')}
      style={{ animationDelay: '0.14s' }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight text-text-main">Task Completed</h2>
        <p className="text-xs text-text-muted">
          {isCompleting ? 'Saving…' : 'Drop completed tasks here'}
        </p>
      </div>

      <ul className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {tasks.length === 0 ? (
          <li
            className={[
              'flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center text-sm transition-colors',
              dragOver
                ? 'border-[rgba(52,175,255,0.55)] bg-[rgba(32,140,255,0.08)] text-text-main'
                : 'border-white/12 text-text-muted',
            ].join(' ')}
          >
            Drop completed tasks here
          </li>
        ) : (
          tasks.map((task) => (
            <li
              key={task.id}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
            >
              <p className="truncate text-sm font-medium text-text-main">{task.title}</p>
              <p className="text-[11px] text-text-muted">
                {task.startTime} · {formatDuration(task.durationMinutes)} ·{' '}
                <span style={{ color: priorityAccent(task.priority) }}>{task.category}</span>
              </p>
            </li>
          ))
        )}
      </ul>
    </GlassCard>
  )
}
