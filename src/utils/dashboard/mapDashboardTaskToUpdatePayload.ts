import type { UpdateTaskPayload } from '../../services/taskService'
import type { Task } from '../../types/task'
import { toApiLocalTime } from '../addTaskApiMapper'
import { recurrenceToApi, reminderToApi } from '../taskApiMetadata'
import { parseTimeOnDate } from '../dateUtils'

function displayTimeToApi(isoDate: string, time12h: string): string | undefined {
  const d = parseTimeOnDate(isoDate, time12h)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return toApiLocalTime(`${h}:${m}`)
}

function statusToApi(status: Task['status']): string {
  if (status === 'completed') return 'COMPLETED'
  if (status === 'current') return 'IN_PROGRESS'
  if (status === 'in_progress') return 'PAUSED'
  return 'PENDING'
}

export function mapDashboardTaskToUpdatePayload(task: Task): UpdateTaskPayload {
  return {
    title: task.title,
    description: task.description.trim() || undefined,
    taskDate: task.date,
    startTime: displayTimeToApi(task.date, task.startTime),
    endTime: displayTimeToApi(task.date, task.endTime),
    plannedDuration: task.durationMinutes,
    priority: task.priority.toUpperCase(),
    category: task.category.trim() || undefined,
    status: statusToApi(task.status),
    progress: task.progressPercent ?? 0,
    actualDuration: task.actualDurationMinutes ?? null,
    startedAt: null,
    pauseReason: null,
    scheduledResumeAt: null,
    tags: task.tags ?? [],
    reminder: reminderToApi(task.reminder ?? 'none'),
    recurrence: recurrenceToApi(task.recurrence ?? 'none'),
  }
}
