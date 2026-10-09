import { updateTask, type TaskApiRecord } from '../../services/taskService'
import type { TaskCompletionReflection, TrackerTask } from '../../types/tracker'
import { mapApiTaskToTrackerTask } from './mapApiTaskToTracker'
import { actualDurationMinutesFromElapsed } from './trackerExecution'
import { mapTrackerTaskToUpdatePayload } from './mapTrackerTaskToUpdatePayload'

export function buildCompletedTrackerTask(
  task: TrackerTask,
  elapsedSeconds: number,
  reflection?: TaskCompletionReflection & { skipReflection?: boolean },
): TrackerTask {
  const actualDurationMinutes = Math.max(
    1,
    actualDurationMinutesFromElapsed(elapsedSeconds) || 1,
  )
  const completedAt = new Date().toISOString()
  return {
    ...task,
    workflowStatus: 'completed',
    status: 'completed',
    progressPercent: 100,
    elapsedSeconds,
    actualDurationMinutes,
    startedAt: undefined,
    completedAt,
    completionSummary: reflection?.skipReflection
      ? task.completionSummary
      : reflection?.completionSummary?.trim() || task.completionSummary,
    achievement: reflection?.skipReflection
      ? task.achievement
      : reflection?.achievement?.trim() || task.achievement,
    reflectionNote: reflection?.skipReflection
      ? task.reflectionNote
      : reflection?.reflectionNote?.trim() || task.reflectionNote,
  }
}

export async function completeTaskOnApi(
  task: TrackerTask,
  elapsedSeconds: number,
  reflection?: TaskCompletionReflection & { skipReflection?: boolean },
): Promise<TaskApiRecord> {
  const completed = buildCompletedTrackerTask(task, elapsedSeconds, reflection)
  const payload = {
    ...mapTrackerTaskToUpdatePayload(completed),
    status: 'COMPLETED' as const,
    progress: 100,
    actualDuration: completed.actualDurationMinutes ?? 1,
    startedAt: null,
  }
  return updateTask(task.id, payload)
}

export function mergeCompletedApiResponse(
  previous: TrackerTask,
  record: TaskApiRecord,
): TrackerTask {
  const mapped = mapApiTaskToTrackerTask(record)
  return {
    ...mapped,
    completionSummary: mapped.completionSummary ?? previous.completionSummary,
    achievement: mapped.achievement ?? previous.achievement,
    reflectionNote: mapped.reflectionNote ?? previous.reflectionNote,
  }
}
