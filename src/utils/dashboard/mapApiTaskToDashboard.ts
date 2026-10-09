import type { TaskApiRecord } from '../../services/taskService'
import type { Task, TaskPriority, TaskStatus } from '../../types/task'
import { recurrenceFromApi, reminderFromApi } from '../taskApiMetadata'
import { formatTime } from '../dateUtils'

function normalizePriority(raw: string | null | undefined): TaskPriority {
  const value = (raw ?? 'medium').toLowerCase()
  if (value === 'high') return 'high'
  if (value === 'low') return 'low'
  return 'medium'
}

function mapStatus(raw: string | null | undefined): TaskStatus {
  const value = (raw ?? 'PENDING').toUpperCase()
  if (value === 'COMPLETED') return 'completed'
  if (value === 'IN_PROGRESS' || value === 'CURRENT') return 'current'
  if (value === 'PAUSED') return 'in_progress'
  return 'upcoming'
}

function priorityAccent(priority: TaskPriority): string {
  switch (priority) {
    case 'high':
      return '#FF5C70'
    case 'medium':
      return '#F5B544'
    default:
      return '#25C8FF'
  }
}

export function formatApiTimeToDisplay(time: string | null | undefined): string {
  if (!time) return '12:00 AM'
  const [hourPart, minutePart] = time.split(':')
  const hours = Number.parseInt(hourPart ?? '0', 10)
  const minutes = Number.parseInt(minutePart ?? '0', 10)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return '12:00 AM'
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return formatTime(date)
}

export function mapApiTaskToDashboardTask(record: TaskApiRecord): Task {
  const priority = normalizePriority(record.priority)
  const durationMinutes = record.plannedDuration ?? 0

  return {
    id: record.id,
    title: record.title,
    description: record.description ?? '',
    date: record.taskDate,
    startTime: formatApiTimeToDisplay(record.startTime),
    endTime: formatApiTimeToDisplay(record.endTime),
    durationMinutes,
    status: mapStatus(record.status),
    category: record.category?.trim() || 'General',
    priority,
    tags: record.tags ?? [],
    reminder: reminderFromApi(record.reminder),
    recurrence: recurrenceFromApi(record.recurrence),
    accentColor: priorityAccent(priority),
    progressPercent: record.progress ?? 0,
    completedAt: record.completedAt ?? undefined,
    actualDurationMinutes: record.actualDuration ?? undefined,
  }
}
