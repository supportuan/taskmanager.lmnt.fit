import type { TrackerTask } from '../types/tracker'
import { formatDuration, formatISODate } from './dateUtils'

export type CompletedDateFilter = 'all' | 'today' | 'week' | 'month'

export interface TimePerformanceMetrics {
  totalCompleted: number
  totalPlannedMinutes: number
  totalActualMinutes: number
  averageActualMinutes: number
  timeSavedMinutes: number
  overPlannedMinutes: number
  earlyCompletionCount: number
  overPlannedCount: number
}

export interface StreakMetrics {
  currentStreakDays: number
  longestStreakDays: number
}

export interface MilestoneDefinition {
  id: string
  label: string
  earned: boolean
}

function completionDayIso(task: TrackerTask): string | null {
  if (!task.completedAt) return task.workflowStatus === 'completed' ? task.date : null
  return formatISODate(new Date(task.completedAt))
}

export function getCompletedTasks(tasks: TrackerTask[]): TrackerTask[] {
  return tasks
    .filter((t) => t.workflowStatus === 'completed')
    .sort((a, b) => {
      const at = a.completedAt ? new Date(a.completedAt).getTime() : 0
      const bt = b.completedAt ? new Date(b.completedAt).getTime() : 0
      return bt - at
    })
}

export function filterCompletedByPeriod(
  tasks: TrackerTask[],
  filter: CompletedDateFilter,
  reference = new Date(),
): TrackerTask[] {
  const completed = getCompletedTasks(tasks)
  if (filter === 'all') return completed

  const todayIso = formatISODate(reference)
  const startOfWeek = new Date(reference)
  startOfWeek.setDate(reference.getDate() - ((reference.getDay() + 6) % 7))
  startOfWeek.setHours(0, 0, 0, 0)

  const startOfMonth = new Date(reference.getFullYear(), reference.getMonth(), 1)

  return completed.filter((t) => {
    const day = completionDayIso(t)
    if (!day) return false
    const d = new Date(day + 'T12:00:00')
    if (filter === 'today') return day === todayIso
    if (filter === 'week') return d >= startOfWeek && d <= reference
    if (filter === 'month') return d >= startOfMonth && d <= reference
    return true
  })
}

export function computeTimePerformance(tasks: TrackerTask[]): TimePerformanceMetrics {
  const completed = getCompletedTasks(tasks)
  let totalPlannedMinutes = 0
  let totalActualMinutes = 0
  let timeSavedMinutes = 0
  let overPlannedMinutes = 0
  let earlyCompletionCount = 0
  let overPlannedCount = 0

  for (const t of completed) {
    const planned = t.durationMinutes
    const actual = t.actualDurationMinutes ?? Math.round(t.elapsedSeconds / 60)
    totalPlannedMinutes += planned
    totalActualMinutes += actual
    const delta = planned - actual
    if (delta > 0) {
      timeSavedMinutes += delta
      earlyCompletionCount += 1
    } else if (delta < 0) {
      overPlannedMinutes += -delta
      overPlannedCount += 1
    }
  }

  const totalCompleted = completed.length
  const averageActualMinutes =
    totalCompleted > 0 ? Math.round(totalActualMinutes / totalCompleted) : 0

  return {
    totalCompleted,
    totalPlannedMinutes,
    totalActualMinutes,
    averageActualMinutes,
    timeSavedMinutes,
    overPlannedMinutes,
    earlyCompletionCount,
    overPlannedCount,
  }
}

function uniqueCompletionDays(tasks: TrackerTask[]): string[] {
  const set = new Set<string>()
  for (const t of getCompletedTasks(tasks)) {
    const day = completionDayIso(t)
    if (day) set.add(day)
  }
  return [...set].sort()
}

function maxConsecutiveDays(sortedDaysAsc: string[]): number {
  if (sortedDaysAsc.length === 0) return 0
  let best = 1
  let run = 1
  for (let i = 1; i < sortedDaysAsc.length; i++) {
    const prev = new Date(sortedDaysAsc[i - 1] + 'T12:00:00')
    const cur = new Date(sortedDaysAsc[i] + 'T12:00:00')
    prev.setDate(prev.getDate() + 1)
    if (
      prev.getFullYear() === cur.getFullYear() &&
      prev.getMonth() === cur.getMonth() &&
      prev.getDate() === cur.getDate()
    ) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }
  return best
}

export function computeStreaks(tasks: TrackerTask[], reference = new Date()): StreakMetrics {
  const days = uniqueCompletionDays(tasks)
  const longestStreakDays = maxConsecutiveDays(days)

  const todayIso = formatISODate(reference)
  const daySet = new Set(days)
  let currentStreakDays = 0
  if (daySet.has(todayIso)) {
    const cursor = new Date(reference)
    while (daySet.has(formatISODate(cursor))) {
      currentStreakDays += 1
      cursor.setDate(cursor.getDate() - 1)
    }
  }

  return { currentStreakDays, longestStreakDays }
}

export function computeMilestones(
  tasks: TrackerTask[],
  streaks: StreakMetrics,
): MilestoneDefinition[] {
  const total = getCompletedTasks(tasks).length
  const checks: { id: string; label: string; earned: boolean }[] = [
    { id: 'first', label: 'First Task Completed', earned: total >= 1 },
    { id: 'five', label: '5 Tasks Completed', earned: total >= 5 },
    { id: 'ten', label: '10 Tasks Completed', earned: total >= 10 },
    { id: 'twenty-five', label: '25 Tasks Completed', earned: total >= 25 },
    { id: 'fifty', label: '50 Tasks Completed', earned: total >= 50 },
    { id: 'streak-7', label: '7-Day Streak', earned: streaks.longestStreakDays >= 7 },
    { id: 'streak-30', label: '30-Day Streak', earned: streaks.longestStreakDays >= 30 },
  ]
  return checks
}

export function motivationalMessage(
  streaks: StreakMetrics,
  performance: TimePerformanceMetrics,
): string {
  if (performance.totalCompleted === 0) {
    return 'Your first win is waiting — finish a task in Task Tracker.'
  }
  if (streaks.currentStreakDays >= 7) {
    return `${streaks.currentStreakDays} days in a row. Keep the momentum going.`
  }
  if (streaks.currentStreakDays >= 3) {
    return "You're building momentum — stay consistent."
  }
  if (performance.earlyCompletionCount >= 3 && performance.timeSavedMinutes > 0) {
    return "You're getting faster at finishing your work."
  }
  if (performance.totalCompleted >= 10) {
    return 'Every completed task is proof that you are moving forward.'
  }
  return 'Progress is built one completed task at a time.'
}

export function efficiencyLabel(planned: number, actual: number): string | null {
  if (planned <= 0 || actual <= 0) return null
  const delta = Math.abs(planned - actual)
  if (actual < planned) {
    const pct = Math.round(((planned - actual) / planned) * 100)
    return `${pct}% faster than planned (${formatDuration(delta)} saved)`
  }
  if (actual > planned) {
    const pct = Math.round(((actual - planned) / planned) * 100)
    return `${pct}% over planned time (${formatDuration(delta)} over)`
  }
  return 'Right on schedule'
}
