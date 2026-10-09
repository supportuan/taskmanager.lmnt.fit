import { formatDuration, formatTime, parseISODate } from './dateUtils'

/** HTML time input value `HH:mm` → display e.g. `10:30 AM` */
export function formatTime12From24(hhmm: string): string {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return formatTime(d)
}

export function dateTimeFromIsoAnd24(iso: string, hhmm: string): Date {
  const d = parseISODate(iso)
  const [h, m] = hhmm.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  return d
}

export function durationMinutesFromRange(
  dateIso: string,
  start24: string,
  end24: string,
): number | null {
  if (!dateIso || !start24 || !end24) return null
  const start = dateTimeFromIsoAnd24(dateIso, start24)
  const end = dateTimeFromIsoAnd24(dateIso, end24)
  const diff = Math.round((end.getTime() - start.getTime()) / 60000)
  if (diff <= 0) return null
  return diff
}

export function formatDurationFromRange(
  dateIso: string,
  start24: string,
  end24: string,
): string {
  const minutes = durationMinutesFromRange(dateIso, start24, end24)
  if (minutes === null) return '—'
  return formatDuration(minutes)
}

export function endTimeFromDuration(start24: string, durationMinutes: number): string {
  return defaultEndFromStart(start24, durationMinutes)
}

export function defaultEndFromStart(start24: string, addMinutes = 60): string {
  const [h, m] = start24.split(':').map(Number)
  const total = h * 60 + m + addMinutes
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}
