import type { TaskApiRecord } from '../../services/taskService'
import type { TrackerTask, TrackerWorkflowStatus } from '../../types/tracker'
import {
  formatApiTimeToDisplay,
  mapApiTaskToDashboardTask,
} from '../dashboard/mapApiTaskToDashboard'
import { computeElapsedSecondsFromApi } from './trackerExecution'

function mapWorkflowStatus(
  apiStatus: string | null | undefined,
  dashboardStatus: TrackerTask['status'],
): TrackerWorkflowStatus {
  const value = (apiStatus ?? '').toUpperCase()
  if (value === 'COMPLETED' || dashboardStatus === 'completed') return 'completed'
  if (value === 'IN_PROGRESS' || dashboardStatus === 'current') return 'in_progress'
  if (value === 'PAUSED' || dashboardStatus === 'in_progress') return 'paused'
  if (value === 'OVERDUE') return 'overdue'
  return 'not_started'
}

export function mapApiTaskToTrackerTask(record: TaskApiRecord): TrackerTask {
  const base = mapApiTaskToDashboardTask(record)
  const elapsedSeconds = computeElapsedSecondsFromApi(record)

  return {
    ...base,
    workflowStatus: mapWorkflowStatus(record.status, base.status),
    progressPercent: record.progress ?? base.progressPercent ?? 0,
    elapsedSeconds,
    actualDurationMinutes:
      record.actualDuration != null ? record.actualDuration : undefined,
    startedAt: record.startedAt ?? undefined,
    completedAt: record.completedAt ?? undefined,
    pauseReason: record.pauseReason ?? undefined,
    scheduledResumeAt: record.scheduledResumeAt ?? undefined,
    completionSummary: record.completionSummary ?? undefined,
    achievement: record.achievement ?? undefined,
    reflectionNote: record.reflectionNote ?? undefined,
    startTime: formatApiTimeToDisplay(record.startTime),
    endTime: formatApiTimeToDisplay(record.endTime),
  }
}
