import type { TaskPriority } from './task'

export type ReminderOption =
  | 'none'
  | '5m'
  | '15m'
  | '30m'
  | '1h'

export type RecurrenceOption = 'none' | 'daily' | 'weekly' | 'monthly'

export interface AddTaskFormState {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  /** Preset duration in minutes (30 | 60 | 90 | 120) */
  durationMinutes: number
  priority: TaskPriority
  category: string
  tags: string[]
  reminder: ReminderOption
  recurrence: RecurrenceOption
}

export interface AddTaskFormErrors {
  title?: string
  date?: string
  startTime?: string
  endTime?: string
  form?: string
}
