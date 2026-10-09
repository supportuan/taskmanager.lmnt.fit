import type { RecurrenceOption, ReminderOption } from '../types/addTaskForm'

export const DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
] as const

export const TASK_CATEGORIES = [
  'Development',
  'Design',
  'Meeting',
  'Personal',
  'Study',
  'Health',
  'Other',
] as const

export const REMINDER_OPTIONS: { value: ReminderOption; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: '5m', label: '5 minutes before' },
  { value: '15m', label: '15 minutes before' },
  { value: '30m', label: '30 minutes before' },
  { value: '1h', label: '1 hour before' },
]

export const RECURRENCE_OPTIONS: { value: RecurrenceOption; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export const CATEGORY_ACCENT: Record<string, string> = {
  Development: '#208CFF',
  Design: '#C45CFF',
  Meeting: '#7B4DFF',
  Personal: '#25C8FF',
  Study: '#A855F7',
  Health: '#2DD4A3',
  Other: '#3BA7FF',
}
