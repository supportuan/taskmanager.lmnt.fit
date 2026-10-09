import type { UpdateTaskPayload } from '../../services/taskService'
import type { TrackerTask } from '../../types/tracker'
import { toApiLocalTime } from '../addTaskApiMapper'
import { parseTimeOnDate } from '../dateUtils'

function displayTimeToApi(isoDate: string, time12h: string): string | undefined {
  const d = parseTimeOnDate(isoDate, time12h)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return toApiLocalTime(`${h}:${m}`)
}

function statusToApi(status: TrackerTask['status'], workflowStatus: TrackerTask['workflowStatus']): string {
  if (workflowStatus === 'completed' || status === 'completed') return 'COMPLETED'
  if (workflowStatus === 'in_progress' || status === 'current') return 'IN_PROGRESS'
  if (workflowStatus === 'paused') return 'PAUSED'
  return 'PENDING'
}

export function mapTrackerTaskToUpdatePayload(task: TrackerTask): UpdateTaskPayload {
  const actualDuration =
    task.actualDurationMinutes ??
    Math.max(0, Math.floor((task.elapsedSeconds ?? 0) / 60))

  return {
    title: task.title,
    description: task.description.trim() || undefined,
    taskDate: task.date,
    startTime: displayTimeToApi(task.date, task.startTime),
    endTime: displayTimeToApi(task.date, task.endTime),
    plannedDuration: task.durationMinutes,
    priority: task.priority.toUpperCase(),
    category: task.category.trim() || undefined,
    status: statusToApi(task.status, task.workflowStatus),
    progress: task.progressPercent ?? 0,
    actualDuration,
    startedAt: task.startedAt ?? null,
    pauseReason: task.pauseReason?.trim() || null,
    scheduledResumeAt: task.scheduledResumeAt ?? null,
    completionSummary: task.completionSummary?.trim() || null,
    achievement: task.achievement?.trim() || null,
    reflectionNote: task.reflectionNote?.trim() || null,
    tags: task.tags ?? [],
    reminder: !task.reminder || task.reminder === 'none' ? null : task.reminder,
    recurrence: !task.recurrence || task.recurrence === 'none' ? null : task.recurrence,
  }
}
