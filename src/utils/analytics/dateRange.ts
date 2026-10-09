import type { AnalyticsFilterState, AnalyticsRangePreset, DateRangeBounds } from '../../types/analytics'
import { formatISODate, parseISODate } from '../dateUtils'

export function defaultAnalyticsFilter(reference = new Date()): AnalyticsFilterState {
  const end = startOfDay(reference)
  const start = new Date(end)
  start.setDate(start.getDate() - 6)
  return {
    range: '7d',
    startDate: formatISODate(start),
    endDate: formatISODate(end),
  }
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function dayStart(iso: string): Date {
  const d = parseISODate(iso)
  d.setHours(0, 0, 0, 0)
  return d
}

export function resolveBounds(filter: AnalyticsFilterState, reference = new Date()): DateRangeBounds {
  const end = filter.endDate ? dayStart(filter.endDate) : dayStart(formatISODate(reference))
  end.setHours(23, 59, 59, 999)

  let start: Date
  if (filter.range === 'custom' && filter.startDate) {
    start = dayStart(filter.startDate)
  } else if (filter.range === 'today') {
    start = dayStart(formatISODate(reference))
  } else if (filter.range === '30d') {
    start = new Date(end)
    start.setDate(start.getDate() - 29)
    start.setHours(0, 0, 0, 0)
  } else if (filter.range === 'month') {
    start = new Date(reference.getFullYear(), reference.getMonth(), 1)
    start.setHours(0, 0, 0, 0)
    const monthEnd = new Date(reference.getFullYear(), reference.getMonth() + 1, 0)
    monthEnd.setHours(23, 59, 59, 999)
    if (monthEnd.getTime() < end.getTime()) {
      end.setTime(monthEnd.getTime())
    }
  } else {
    start = new Date(end)
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
  }

  if (start > end) {
    const tmp = start
    start = dayStart(formatISODate(end))
    end.setTime(dayStart(formatISODate(tmp)).getTime())
    end.setHours(23, 59, 59, 999)
  }

  return {
    start,
    end,
    startIso: formatISODate(start),
    endIso: formatISODate(end),
  }
}

export function previousPeriodBounds(bounds: DateRangeBounds): DateRangeBounds {
  const msPerDay = 86400000
  const days =
    Math.round((bounds.end.getTime() - bounds.start.getTime()) / msPerDay) + 1
  const prevEnd = new Date(bounds.start)
  prevEnd.setDate(prevEnd.getDate() - 1)
  prevEnd.setHours(23, 59, 59, 999)
  const prevStart = new Date(prevEnd)
  prevStart.setDate(prevStart.getDate() - (days - 1))
  prevStart.setHours(0, 0, 0, 0)
  return {
    start: prevStart,
    end: prevEnd,
    startIso: formatISODate(prevStart),
    endIso: formatISODate(prevEnd),
  }
}

export function enumerateDays(bounds: DateRangeBounds): string[] {
  const days: string[] = []
  const cursor = new Date(bounds.start)
  cursor.setHours(12, 0, 0, 0)
  const endMs = bounds.end.getTime()
  while (cursor.getTime() <= endMs) {
    days.push(formatISODate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export function applyPreset(
  preset: AnalyticsRangePreset,
  reference = new Date(),
): AnalyticsFilterState {
  const endIso = formatISODate(reference)
  if (preset === 'today') {
    return { range: 'today', startDate: endIso, endDate: endIso }
  }
  if (preset === '7d') {
    const start = new Date(reference)
    start.setDate(start.getDate() - 6)
    return { range: '7d', startDate: formatISODate(start), endDate: endIso }
  }
  if (preset === '30d') {
    const start = new Date(reference)
    start.setDate(start.getDate() - 29)
    return { range: '30d', startDate: formatISODate(start), endDate: endIso }
  }
  if (preset === 'month') {
    const start = new Date(reference.getFullYear(), reference.getMonth(), 1)
    return { range: 'month', startDate: formatISODate(start), endDate: endIso }
  }
  return defaultAnalyticsFilter(reference)
}

export function formatDayLabel(iso: string, bounds: DateRangeBounds): string {
  const d = parseISODate(iso)
  const span =
    Math.round((bounds.end.getTime() - bounds.start.getTime()) / 86400000) + 1
  if (span <= 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  }
  if (span <= 14) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  const dayIndex = enumerateDays(bounds).indexOf(iso)
  const step = span <= 31 ? 7 : 14
  if (dayIndex % step === 0 || iso === bounds.endIso || iso === bounds.startIso) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  return ''
}
