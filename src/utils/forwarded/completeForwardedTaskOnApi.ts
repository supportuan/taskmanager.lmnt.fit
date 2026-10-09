import { updateTask, type TaskApiRecord } from '../../services/taskService'
import type { Task } from '../../types/task'
import { mapDashboardTaskToUpdatePayload } from '../dashboard/mapDashboardTaskToUpdatePayload'

/**
 * Marks a forwarded (overdue incomplete) task completed via the existing PUT /api/tasks API.
 */
export async function completeForwardedTaskOnApi(task: Task): Promise<TaskApiRecord> {
  const base = mapDashboardTaskToUpdatePayload(task)
  const actualDuration =
    task.actualDurationMinutes != null && task.actualDurationMinutes > 0
      ? task.actualDurationMinutes
      : Math.max(1, task.durationMinutes || 1)

  return updateTask(task.id, {
    ...base,
    status: 'COMPLETED',
    progress: 100,
    actualDuration,
    startedAt: null,
  })
}
