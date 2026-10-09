import type { AddTaskFormState } from '../types/addTaskForm'
import type { CreateTaskPayload } from '../services/taskService'
import {
  normalizeTagsForApi,
  recurrenceToApi,
  reminderToApi,
} from './taskApiMetadata'

/** HH:mm → HH:mm:ss for Spring LocalTime JSON */
export function toApiLocalTime(hhmm: string): string | undefined {
  const trimmed = hhmm.trim()
  if (!trimmed) return undefined
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`
  return trimmed
}

export function priorityToApi(priority: AddTaskFormState['priority']): string {
  return priority.toUpperCase()
}

export function mapAddTaskFormToCreatePayload(form: AddTaskFormState): CreateTaskPayload {
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    taskDate: form.date,
    startTime: toApiLocalTime(form.startTime),
    endTime: toApiLocalTime(form.endTime),
    plannedDuration: form.durationMinutes,
    priority: priorityToApi(form.priority),
    category: form.category.trim() || undefined,
    status: 'PENDING',
    progress: 0,
    tags: normalizeTagsForApi(form.tags),
    reminder: reminderToApi(form.reminder),
    recurrence: recurrenceToApi(form.recurrence),
  }
}
