import { ArrowRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { TrackerTask } from '../../types/tracker'
import { formatDuration } from '../../utils/dateUtils'
import { Button } from '../common/Button'
import { GlassCard } from '../layout/GlassCard'

interface FocusNextTaskCardProps {
  task: TrackerTask | undefined
}

export function FocusNextTaskCard({ task }: FocusNextTaskCardProps) {
  if (!task) {
    return (
      <GlassCard tier="secondary" className="flex flex-col items-center px-5 py-10 text-center">
        <p className="font-medium text-text-main">You&apos;re all caught up.</p>
        <p className="mt-1 text-sm text-text-muted">You have no upcoming tasks.</p>
        <Link to="/add-task" className="mt-5">
          <Button type="button" variant="secondary">
            Add a task
          </Button>
        </Link>
      </GlassCard>
    )
  }

  return (
    <GlassCard tier="secondary" className="p-5 lg:p-6" style={{ animationDelay: '0.18s' }}>
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
        <ArrowRight className="h-3.5 w-3.5 text-primary-cyan" strokeWidth={2} />
        Next task
      </div>
      <h3 className="text-lg font-semibold text-text-main">{task.title}</h3>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary">
        <Clock className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
        {task.startTime} · {formatDuration(task.durationMinutes)}
      </p>
      <p className="mt-1 text-xs text-text-muted">
        {task.category} · <span className="capitalize">{task.priority}</span> priority
      </p>
    </GlassCard>
  )
}
