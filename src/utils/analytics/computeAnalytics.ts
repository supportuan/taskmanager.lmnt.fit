import type { TrackerTask } from '../../types/tracker'
import type { AnalyticsBundle, AnalyticsFilterState } from '../../types/analytics'
import { parseISODate } from '../dateUtils'
import { computeStreaks, efficiencyLabel } from '../completedMetrics'
import {
  enumerateDays,
  formatDayLabel,
  previousPeriodBounds,
  resolveBounds,
} from './dateRange'
import { formatTrendDelta } from './formatting'
import { generateProductivityInsights } from './insights'
import { calculateProductivityScore } from './score'
import {
  actualMinutes,
  completionDayIso,
  filterCompletedInRange,
  filterScheduledInRange,
  taskScheduledOn,
} from './tasks'

function completionRate(planned: number, completed: number): number | null {
  if (planned <= 0) return null
  return Math.min(100, (completed / planned) * 100)
}

function completedOnDay(tasks: TrackerTask[], iso: string): number {
  return tasks.filter((t) => {
    if (t.workflowStatus !== 'completed') return false
    return completionDayIso(t) === iso
  }).length
}

function uniqueCompletionDaysInRange(tasks: TrackerTask[], bounds: ReturnType<typeof resolveBounds>) {
  const set = new Set<string>()
  for (const t of filterCompletedInRange(tasks, bounds)) {
    const day = completionDayIso(t)
    if (day) set.add(day)
  }
  return set.size
}

function buildDailyCompletion(tasks: TrackerTask[], bounds: ReturnType<typeof resolveBounds>) {
  return enumerateDays(bounds).map((iso) => {
    const plannedTasks = tasks.filter((t) => taskScheduledOn(t, iso)).length
    const done = completedOnDay(tasks, iso)
    return {
      date: iso,
      label: formatDayLabel(iso, bounds),
      plannedTasks,
      completedTasks: done,
      completionRate: completionRate(plannedTasks, done) ?? 0,
    }
  })
}

function buildDailyTime(tasks: TrackerTask[], bounds: ReturnType<typeof resolveBounds>) {
  return enumerateDays(bounds).map((iso) => {
    let plannedMinutes = 0
    let actualMinutesTotal = 0
    for (const t of tasks) {
      if (taskScheduledOn(t, iso)) plannedMinutes += t.durationMinutes
    }
    for (const t of tasks) {
      if (t.workflowStatus !== 'completed') continue
      if (completionDayIso(t) === iso) actualMinutesTotal += actualMinutes(t)
    }
    return {
      date: iso,
      label: formatDayLabel(iso, bounds),
      plannedMinutes,
      actualMinutes: actualMinutesTotal,
    }
  })
}

function categoryBreakdown(completed: TrackerTask[]) {
  const map = new Map<string, number>()
  for (const t of completed) {
    const cat = t.category?.trim() || 'Uncategorized'
    map.set(cat, (map.get(cat) ?? 0) + actualMinutes(t))
  }
  return [...map.entries()]
    .map(([category, actualMinutesVal]) => ({ category, actualMinutes: actualMinutesVal }))
    .sort((a, b) => b.actualMinutes - a.actualMinutes)
}

function priorityBreakdown(completed: TrackerTask[]) {
  const map = new Map<string, number>()
  for (const t of completed) {
    const pri = t.priority ?? 'medium'
    const key = pri.charAt(0).toUpperCase() + pri.slice(1)
    map.set(key, (map.get(key) ?? 0) + actualMinutes(t))
  }
  return [...map.entries()]
    .map(([priority, actualMinutesVal]) => ({ priority, actualMinutes: actualMinutesVal }))
    .sort((a, b) => b.actualMinutes - a.actualMinutes)
}

export function computeAnalytics(
  tasks: TrackerTask[],
  filter: AnalyticsFilterState,
  reference = new Date(),
): AnalyticsBundle {
  const bounds = resolveBounds(filter, reference)
  const previousBounds = previousPeriodBounds(bounds)

  const scheduled = filterScheduledInRange(tasks, bounds)
  const completed = filterCompletedInRange(tasks, bounds)
  const prevScheduled = filterScheduledInRange(tasks, previousBounds)
  const prevCompleted = filterCompletedInRange(tasks, previousBounds)

  const tasksPlanned = scheduled.length
  const tasksCompleted = completed.length
  const rate = completionRate(tasksPlanned, tasksCompleted)

  let timeWorkedMinutes = 0
  for (const t of completed) {
    timeWorkedMinutes += Math.max(0, actualMinutes(t))
  }
  timeWorkedMinutes = Math.max(0, Math.round(timeWorkedMinutes))

  const averageTaskMinutes =
    tasksCompleted > 0 ? timeWorkedMinutes / tasksCompleted : null

  const streaks = computeStreaks(tasks, reference)

  const prevRate = completionRate(prevScheduled.length, prevCompleted.length)
  const prevTime = prevCompleted.reduce((s, t) => s + actualMinutes(t), 0)
  const prevAvg =
    prevCompleted.length > 0 ? prevTime / prevCompleted.length : null

  const canCompare = prevScheduled.length > 0 || prevCompleted.length > 0
  const showRateTrend = canCompare && tasksPlanned > 0 && prevScheduled.length > 0
  const showAvgTrend =
    canCompare &&
    tasksCompleted >= 2 &&
    prevCompleted.length >= 1 &&
    averageTaskMinutes != null &&
    prevAvg != null

  const daily = buildDailyCompletion(tasks, bounds)
  const rateDays = daily.filter((d) => d.plannedTasks > 0)
  const bestDay =
    rateDays.length > 0
      ? [...rateDays].sort(
          (a, b) =>
            b.completionRate - a.completionRate || b.completedTasks - a.completedTasks,
        )[0]
      : null
  const lowestDay =
    rateDays.length > 0
      ? [...rateDays].sort(
          (a, b) =>
            a.completionRate - b.completionRate || a.completedTasks - b.completedTasks,
        )[0]
      : null
  const avgDailyRate =
    rateDays.length > 0
      ? rateDays.reduce((s, d) => s + d.completionRate, 0) / rateDays.length
      : null

  let insightLine: string | null = null
  if (bestDay && bestDay.plannedTasks > 0) {
    const dayName =
      bestDay.label ||
      parseISODate(bestDay.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    insightLine = `${dayName} was your strongest day with ${Math.round(bestDay.completionRate)}% completion.`
  }

  const dailyTime = buildDailyTime(tasks, bounds)
  const totalPlannedMinutes = completed.reduce((s, t) => s + t.durationMinutes, 0)
  const totalActualMinutes = timeWorkedMinutes
  const timeDeltaMinutes = totalPlannedMinutes - totalActualMinutes

  const totalDays = enumerateDays(bounds).length
  const completionDays = uniqueCompletionDaysInRange(tasks, bounds)

  const productivityScore = calculateProductivityScore({
    completionRate: rate,
    plannedMinutes: totalPlannedMinutes,
    actualMinutes: totalActualMinutes,
    completionDays,
    totalDays,
  })

  const overview = {
    completionRate: rate,
    tasksCompleted,
    tasksPlanned,
    timeWorkedMinutes,
    averageTaskMinutes,
    currentStreakDays: streaks.currentStreakDays,
    trends: {
      completionRate:
        showRateTrend && rate != null && prevRate != null
          ? formatTrendDelta(rate, prevRate, 'percent')
          : undefined,
      tasksCompleted: canCompare
        ? formatTrendDelta(tasksCompleted, prevCompleted.length, 'count')
        : undefined,
      timeWorked: canCompare
        ? formatTrendDelta(timeWorkedMinutes, prevTime, 'minutes')
        : undefined,
      averageTask:
        showAvgTrend ? formatTrendDelta(averageTaskMinutes!, prevAvg!, 'minutes') : undefined,
    },
  }

  const timeSummary = {
    daily: dailyTime,
    totalPlannedMinutes,
    totalActualMinutes,
    timeDeltaMinutes,
    efficiencyLabel: efficiencyLabel(totalPlannedMinutes, totalActualMinutes),
    categoryBreakdown: categoryBreakdown(completed),
    priorityBreakdown: priorityBreakdown(completed),
    averageDurationTrend: dailyTime,
  }

  const insights = generateProductivityInsights({
    overview,
    completion: {
      daily,
      bestDay,
      lowestDay,
      averageDailyCompletionRate: avgDailyRate,
      insightLine,
    },
    time: timeSummary,
    productivityScore,
    previousCompletionRate: prevRate,
  })

  const hasEnoughData = tasksCompleted > 0 || tasksPlanned > 0
  const isEmpty = tasksCompleted === 0 && tasksPlanned === 0

  return {
    filter,
    bounds,
    previousBounds: canCompare ? previousBounds : null,
    overview,
    completion: {
      daily,
      bestDay,
      lowestDay,
      averageDailyCompletionRate: avgDailyRate,
      insightLine,
    },
    time: timeSummary,
    productivityScore,
    insights,
    hasEnoughData,
    isEmpty,
  }
}
