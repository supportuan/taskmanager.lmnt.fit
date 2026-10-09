import type { TrackerTask, TrackerWorkflowStatus } from '../types/tracker'
import { formatISODate } from './dateUtils'
import { parseTimeOnDate } from './dateUtils'
import { sortTasksByStart, tasksForDate } from './trackerUtils'

function taskScheduleMs(task: TrackerTask): number {
  return parseTimeOnDate(task.date, task.startTime).getTime()
}

export function resolveFocusCurrentTask(tasks: TrackerTask[]): TrackerTask | undefined {
  const open = sortTasksByStart(
    tasks.filter(
      (t) => t.workflowStatus !== 'completed' && t.workflowStatus !== 'overdue',
    ),
  )
  const active = open.find(
    (t) => t.workflowStatus === 'in_progress' || t.status === 'current',
  )
  if (active) return active
  const paused = open.find((t) => t.workflowStatus === 'paused')
  if (paused) return paused
  const today = formatISODate(new Date())
  const todayOpen = tasksForDate(tasks, today).filter(
    (t) => t.workflowStatus !== 'completed' && t.workflowStatus !== 'overdue',
  )
  const todayCurrent = todayOpen.find((t) => t.status === 'current')
  if (todayCurrent) return todayCurrent
  if (todayOpen[0]) return todayOpen[0]
  return open[0]
}

export function resolveFocusNextTask(
  tasks: TrackerTask[],
  current: TrackerTask | undefined,
): TrackerTask | undefined {
  const open = sortTasksByStart(
    tasks.filter(
      (t) => t.workflowStatus !== 'completed' && t.workflowStatus !== 'overdue',
    ),
  )
  if (!current) {
    const cur = resolveFocusCurrentTask(tasks)
    if (!cur) return undefined
    return open.find((t) => t.id !== cur.id)
  }
  const currentMs = taskScheduleMs(current)
  return open.find(
    (t) => t.id !== current.id && taskScheduleMs(t) > currentMs,
  )
}

export function focusStatusLabel(
  workflow: TrackerWorkflowStatus | undefined,
  focusRunning: boolean,
  focusPaused: boolean,
  sessionComplete: boolean,
): string {
  if (sessionComplete) return 'SESSION COMPLETE'
  if (focusRunning) return 'FOCUSING'
  if (focusPaused) return 'PAUSED'
  if (workflow === 'completed') return 'TASK COMPLETED'
  if (workflow === 'in_progress') return 'IN PROGRESS'
  if (workflow === 'paused') return 'PAUSED'
  return 'READY TO FOCUS'
}

export const FOCUS_DURATIONS_MIN = [25, 45, 60, 90] as const
export const SHORT_BREAK_MIN = 5
export const LONG_BREAK_MIN = 15
