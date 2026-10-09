import type { TrackerTask } from '../../types/tracker'
import type { DateRangeBounds } from '../../types/analytics'
import { formatISODate } from '../dateUtils'

export function taskScheduledOn(task: TrackerTask, iso: string): boolean {
  return task.date === iso
}

export function taskInScheduledRange(task: TrackerTask, bounds: DateRangeBounds): boolean {
  const d = task.date
  return d >= bounds.startIso && d <= bounds.endIso
}

export function completionDayIso(task: TrackerTask): string | null {
  if (task.completedAt) return formatISODate(new Date(task.completedAt))
  if (task.workflowStatus === 'completed') return task.date
  return null
}

export function taskCompletedInRange(task: TrackerTask, bounds: DateRangeBounds): boolean {
  if (task.workflowStatus !== 'completed') return false
  const day = completionDayIso(task)
  if (!day) return false
  return day >= bounds.startIso && day <= bounds.endIso
}

export function filterScheduledInRange(
  tasks: TrackerTask[],
  bounds: DateRangeBounds,
): TrackerTask[] {
  return tasks.filter((t) => taskInScheduledRange(t, bounds))
}

export function filterCompletedInRange(
  tasks: TrackerTask[],
  bounds: DateRangeBounds,
): TrackerTask[] {
  return tasks.filter((t) => taskCompletedInRange(t, bounds))
}

export function actualMinutes(task: TrackerTask): number {
  if (task.actualDurationMinutes != null) return task.actualDurationMinutes
  if (task.workflowStatus === 'completed') {
    return Math.max(1, Math.round(task.elapsedSeconds / 60))
  }
  return 0
}
