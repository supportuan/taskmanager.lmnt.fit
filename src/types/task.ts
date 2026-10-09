export type TaskStatus = 'completed' | 'current' | 'upcoming' | 'in_progress'

import type { RecurrenceOption, ReminderOption } from './addTaskForm'

export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  title: string
  startTime: string
  endTime: string
  durationMinutes: number
  status: TaskStatus
  category: string
  priority: TaskPriority
  description: string
  tags: string[]
  /** Present on API-backed tasks; local seed data may omit (defaults to `none`). */
  reminder?: ReminderOption
  recurrence?: RecurrenceOption
  date: string
  accentColor: string
  progressPercent?: number
  completedAt?: string
  actualDurationMinutes?: number
}

export interface ProductivityStats {
  completionPercent: number
  timeWorkedMinutes: number
  tasksCompleted: number
  currentStreakDays: number
}

export type ScheduleViewMode = 'hours' | 'tasks'
