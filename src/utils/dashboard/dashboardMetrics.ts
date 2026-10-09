import type { TaskApiRecord } from '../../services/taskService'
import type { ProductivityStats } from '../../types/task'
import { formatISODate } from '../dateUtils'

export function isApiTaskCompleted(status: string | null | undefined): boolean {
  return (status ?? '').toUpperCase() === 'COMPLETED'
}

function completionDayIso(task: TaskApiRecord): string | null {
  if (task.completedAt) {
    return formatISODate(new Date(task.completedAt))
  }
  if (isApiTaskCompleted(task.status)) {
    return task.taskDate
  }
  return null
}

function computeCurrentStreakDays(tasks: TaskApiRecord[], reference = new Date()): number {
  const days = new Set<string>()
  for (const task of tasks) {
    const day = completionDayIso(task)
    if (day) days.add(day)
  }
  if (days.size === 0) return 0

  const todayIso = formatISODate(reference)
  if (!days.has(todayIso)) return 0

  let streak = 0
  const cursor = new Date(reference)
  while (days.has(formatISODate(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function computeDashboardMetrics(tasks: TaskApiRecord[]): ProductivityStats {
  const total = tasks.length
  const completedTasks = tasks.filter((t) => isApiTaskCompleted(t.status))
  const tasksCompleted = completedTasks.length

  const completionPercent =
    total === 0 ? 0 : Math.round((tasksCompleted / total) * 100)

  const timeWorkedMinutes = completedTasks.reduce((sum, task) => {
    const minutes =
      task.actualDuration != null && task.actualDuration > 0
        ? task.actualDuration
        : task.plannedDuration ?? 0
    return sum + minutes
  }, 0)

  const currentStreakDays = computeCurrentStreakDays(tasks)

  return {
    completionPercent,
    timeWorkedMinutes,
    tasksCompleted,
    currentStreakDays,
  }
}
