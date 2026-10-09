import type { TaskApiRecord } from '../../services/taskService'
import type { TrackerTask } from '../../types/tracker'
import { progressFromElapsedSeconds } from '../trackerUtils'

export function computeElapsedSecondsFromApi(
  record: Pick<TaskApiRecord, 'status' | 'actualDuration' | 'startedAt'>,
  nowMs: number = Date.now(),
): number {
  const baseSeconds = Math.max(0, (record.actualDuration ?? 0) * 60)
  const status = (record.status ?? '').toUpperCase()
  if (status === 'IN_PROGRESS' && record.startedAt) {
    const startedMs = new Date(record.startedAt).getTime()
    if (Number.isFinite(startedMs)) {
      const segment = Math.max(0, Math.floor((nowMs - startedMs) / 1000))
      return baseSeconds + segment
    }
  }
  return baseSeconds
}

export function computeElapsedSeconds(task: TrackerTask, nowMs: number = Date.now()): number {
  const status =
    task.workflowStatus === 'in_progress'
      ? 'IN_PROGRESS'
      : task.workflowStatus === 'paused'
        ? 'PAUSED'
        : task.workflowStatus === 'completed'
          ? 'COMPLETED'
          : 'PENDING'
  return computeElapsedSecondsFromApi(
    {
      status,
      actualDuration: task.actualDurationMinutes ?? 0,
      startedAt: task.startedAt ?? null,
    },
    nowMs,
  )
}

export function actualDurationMinutesFromElapsed(elapsedSeconds: number): number {
  return Math.max(0, Math.floor(elapsedSeconds / 60))
}

export function progressForTask(task: TrackerTask, nowMs?: number): number {
  const elapsed = computeElapsedSeconds(task, nowMs)
  const fromElapsed = progressFromElapsedSeconds(task.durationMinutes, elapsed)
  if (task.workflowStatus === 'completed') return 100
  return Math.max(task.progressPercent ?? 0, fromElapsed)
}

export function findActiveTaskId(tasks: TrackerTask[]): number | undefined {
  const inProgress = tasks.find((t) => t.workflowStatus === 'in_progress')
  if (inProgress) return inProgress.id
  return undefined
}
