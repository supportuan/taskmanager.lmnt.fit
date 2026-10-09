import { ApiError } from '../../services/api'
import { updateTask } from '../../services/taskService'
import type { TrackerTask } from '../../types/tracker'
import { mapApiTaskToTrackerTask } from './mapApiTaskToTracker'
import { mapTrackerTaskToUpdatePayload } from './mapTrackerTaskToUpdatePayload'

export type PersistResult =
  | { ok: true; task: TrackerTask }
  | { ok: false; message: string; status?: number }

export async function persistTrackerTask(task: TrackerTask): Promise<PersistResult> {
  try {
    const record = await updateTask(task.id, mapTrackerTaskToUpdatePayload(task))
    const mapped = mapApiTaskToTrackerTask(record)
    return {
      ok: true,
      task: {
        ...mapped,
        completionSummary: mapped.completionSummary ?? task.completionSummary,
        achievement: mapped.achievement ?? task.achievement,
        reflectionNote: mapped.reflectionNote ?? task.reflectionNote,
      },
    }
  } catch (error) {
    if (error instanceof ApiError) {
      const message =
        error.status === 401
          ? 'Your session expired. Please sign in again.'
          : error.message || 'Unable to save task. Please try again.'
      return { ok: false, message, status: error.status }
    }
    return { ok: false, message: 'Unable to save task. Please try again.' }
  }
}
