import type { TaskCompletionReflection, TrackerTask, TrackerWorkflowStatus } from '../types/tracker'
import { sortTasksByStart } from './trackerUtils'

export function promoteNextTaskAfterComplete(
  tasks: TrackerTask[],
  completedId: number,
  selectedIso: string,
): number | null {
  const remaining = sortTasksByStart(
    tasks.filter(
      (t) =>
        t.date === selectedIso && t.workflowStatus !== 'completed' && t.id !== completedId,
    ),
  )
  return remaining[0]?.id ?? null
}

export function applyCompletionToTasks(
  tasks: TrackerTask[],
  taskId: number,
  elapsedSeconds: number,
  reflection: TaskCompletionReflection & { skipReflection?: boolean },
): TrackerTask[] {
  const actualMinutes = Math.max(1, Math.round(elapsedSeconds / 60))
  const completedAt = new Date().toISOString()
  return tasks.map((t) => {
    if (t.id !== taskId) return t
    return {
      ...t,
      workflowStatus: 'completed' as TrackerWorkflowStatus,
      status: 'completed' as const,
      progressPercent: 100,
      elapsedSeconds,
      actualDurationMinutes: actualMinutes,
      completedAt,
      completionSummary: reflection.skipReflection
        ? t.completionSummary
        : reflection.completionSummary?.trim() || undefined,
      achievement: reflection.skipReflection
        ? t.achievement
        : reflection.achievement?.trim() || undefined,
      reflectionNote: reflection.skipReflection
        ? t.reflectionNote
        : reflection.reflectionNote?.trim() || undefined,
    }
  })
}
