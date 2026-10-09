import type { TrackerTask } from '../types/tracker'
import { parseISODate, parseTimeOnDate } from './dateUtils'

export function sortTasksByStart(tasks: TrackerTask[]): TrackerTask[] {
  return [...tasks].sort(
    (a, b) =>
      parseTimeOnDate(a.date, a.startTime).getTime() -
      parseTimeOnDate(b.date, b.startTime).getTime(),
  )
}

export function tasksForDate(tasks: TrackerTask[], iso: string): TrackerTask[] {
  return sortTasksByStart(tasks.filter((t) => t.date === iso))
}

export function nextIncompleteTasks(tasks: TrackerTask[], limit = 6): TrackerTask[] {
  return sortTasksByStart(
    tasks.filter((t) => t.workflowStatus !== 'completed' && t.workflowStatus !== 'overdue'),
  ).slice(0, limit)
}

export function completedTasksForDate(tasks: TrackerTask[], iso: string): TrackerTask[] {
  return sortTasksByStart(
    tasks.filter((t) => t.date === iso && t.workflowStatus === 'completed'),
  )
}

export function formatTimer(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function remainingSeconds(task: TrackerTask): number {
  return remainingFromElapsed(task.durationMinutes, task.elapsedSeconds)
}

export function remainingFromElapsed(durationMinutes: number, elapsedSeconds: number): number {
  const planned = durationMinutes * 60
  return Math.max(0, planned - elapsedSeconds)
}

export function progressFromElapsedSeconds(
  durationMinutes: number,
  elapsedSeconds: number,
): number {
  const planned = durationMinutes * 60
  if (planned <= 0) return 0
  return Math.min(100, Math.round((elapsedSeconds / planned) * 100))
}

export function progressFromElapsed(task: TrackerTask): number {
  const planned = task.durationMinutes * 60
  if (planned <= 0) return 0
  return Math.min(100, Math.round((task.elapsedSeconds / planned) * 100))
}

export function shiftISODate(iso: string, days: number): string {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
