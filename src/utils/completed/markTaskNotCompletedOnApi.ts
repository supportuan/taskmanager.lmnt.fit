import { updateTask, type TaskApiRecord } from '../../services/taskService'
import type { TrackerTask } from '../../types/tracker'
import { mapTrackerTaskToUpdatePayload } from '../tracker/mapTrackerTaskToUpdatePayload'

/**
 * Reverts a completed task to PENDING via PUT /api/tasks/{id}.
 * Preserves metadata and actualDuration; clears completion and execution session fields.
 */
export async function markTaskNotCompletedOnApi(task: TrackerTask): Promise<TaskApiRecord> {
  const base = mapTrackerTaskToUpdatePayload({
    ...task,
    workflowStatus: 'not_started',
    status: 'upcoming',
    progressPercent: 0,
    startedAt: undefined,
    completedAt: undefined,
    pauseReason: undefined,
    scheduledResumeAt: undefined,
  })

  const actualDuration =
    task.actualDurationMinutes != null ? task.actualDurationMinutes : (base.actualDuration ?? null)

  return updateTask(task.id, {
    ...base,
    status: 'PENDING',
    progress: 0,
    startedAt: null,
    pauseReason: null,
    scheduledResumeAt: null,
    actualDuration,
  })
}
