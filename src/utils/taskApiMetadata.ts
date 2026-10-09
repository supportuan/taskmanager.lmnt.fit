import type { RecurrenceOption, ReminderOption } from '../types/addTaskForm'

const REMINDER_VALUES: ReminderOption[] = ['none', '5m', '15m', '30m', '1h']
const RECURRENCE_VALUES: RecurrenceOption[] = ['none', 'daily', 'weekly', 'monthly']

export function reminderToApi(reminder: ReminderOption): string | null {
  return reminder === 'none' ? null : reminder
}

export function recurrenceToApi(recurrence: RecurrenceOption): string | null {
  return recurrence === 'none' ? null : recurrence
}

export function reminderFromApi(value: string | null | undefined): ReminderOption {
  if (!value || value === 'none') return 'none'
  if (REMINDER_VALUES.includes(value as ReminderOption)) return value as ReminderOption
  return 'none'
}

export function recurrenceFromApi(value: string | null | undefined): RecurrenceOption {
  if (!value || value === 'none') return 'none'
  if (RECURRENCE_VALUES.includes(value as RecurrenceOption)) return value as RecurrenceOption
  return 'none'
}

export function normalizeTagsForApi(tags: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of tags) {
    const label = raw.trim()
    if (!label) continue
    const key = label.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(label)
  }
  return out
}
