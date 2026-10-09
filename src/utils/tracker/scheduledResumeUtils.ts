import { formatISODate, parseISODate } from '../dateUtils'

export function defaultResumeDateIso(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return formatISODate(d)
}

/** Combine local calendar date (YYYY-MM-DD) and 24h time (HH:mm) to ISO instant. */
export function scheduledResumeAtFromLocal(dateIso: string, time24: string): string | null {
  const timeMatch = time24.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!timeMatch) return null
  const hours = Number.parseInt(timeMatch[1], 10)
  const minutes = Number.parseInt(timeMatch[2], 10)
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null
  }
  const base = parseISODate(dateIso)
  base.setHours(hours, minutes, 0, 0)
  return base.toISOString()
}

export function formatScheduledResumeDisplay(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
