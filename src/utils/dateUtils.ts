const WEEKDAYS_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export function formatISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function formatHeaderDate(date: Date): string {
  const weekday = WEEKDAYS_LONG[date.getDay()]
  const day = date.getDate()
  const month = MONTHS_LONG[date.getMonth()]
  const year = date.getFullYear()
  return `${weekday}, ${day} ${month} ${year}`
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDisplayDate(iso: string): string {
  const d = parseISODate(iso)
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`
}

export function getGreeting(date: Date): string {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export interface CalendarCell {
  date: Date
  iso: string
  inCurrentMonth: boolean
}

export function getCalendarGrid(viewMonth: Date): CalendarCell[] {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = (firstOfMonth.getDay() + 6) % 7
  const gridStart = new Date(year, month, 1 - startOffset)

  const cells: CalendarCell[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)
    cells.push({
      date,
      iso: formatISODate(date),
      inCurrentMonth: date.getMonth() === month,
    })
  }
  return cells
}

export function formatMonthYear(date: Date): string {
  return `${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`
}

/** Local calendar date heading for the dashboard schedule card. */
export function formatScheduleHeading(iso: string, today: Date = new Date()): string {
  if (iso === formatISODate(today)) {
    return "Today's Schedule"
  }
  const d = parseISODate(iso)
  return `${MONTHS_LONG[d.getMonth()]} ${d.getDate()} Schedule`
}

export function isValidISODateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = parseISODate(value)
  return formatISODate(d) === value
}

export const CALENDAR_WEEKDAY_LABELS = [
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
]

export function parseTimeOnDate(isoDate: string, time12h: string): Date {
  const base = parseISODate(isoDate)
  const match = time12h.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return base
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const meridiem = match[3].toUpperCase()
  if (meridiem === 'PM' && hours !== 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  base.setHours(hours, minutes, 0, 0)
  return base
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return h === 1 ? '1 hour' : `${h} hours`
  return `${h}h ${m}m`
}

export function formatTimeWorked(totalMinutes: number): string {
  const safe = Number.isFinite(totalMinutes) ? Math.max(0, Math.round(totalMinutes)) : 0
  const h = Math.floor(safe / 60)
  const m = safe % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}

/** Compact label for performance deltas (saved / over plan). */
export function formatMinutesSummary(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 min'
  if (totalMinutes < 60) return formatDuration(totalMinutes)
  return formatTimeWorked(totalMinutes)
}

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export function formatCompletionTimestamp(iso: string, reference = new Date()): string {
  const d = new Date(iso)
  const dayIso = formatISODate(d)
  const todayIso = formatISODate(reference)
  const time = formatTime(d)
  if (dayIso === todayIso) return `Completed today · ${time}`
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${time}`
}
