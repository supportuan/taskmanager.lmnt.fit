import type { Task, TaskPriority } from './task'

export type TrackerWorkflowStatus =
  | 'not_started'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'overdue'

export interface TaskCompletionReflection {
  completionSummary?: string
  achievement?: string
  reflectionNote?: string
}

export interface TrackerTask extends Task, TaskCompletionReflection {
  workflowStatus: TrackerWorkflowStatus
  progressPercent: number
  elapsedSeconds: number
  /** Minutes spent when completed (from timer). */
  actualDurationMinutes?: number
  startedAt?: string
  completedAt?: string
  pauseReason?: string
  scheduledResumeAt?: string
}

export interface PauseTaskPayload {
  pauseReason: string
  scheduledResumeAt: string
}

export function priorityAccent(priority: TaskPriority): string {
  switch (priority) {
    case 'high':
      return '#FF5C70'
    case 'medium':
      return '#F5B544'
    default:
      return '#25C8FF'
  }
}
