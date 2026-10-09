import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTaskFlow } from '../context/TaskFlowContext'
import { ApiError } from '../services/api'
import { isBackendAuthEnabled } from '../services/auth/authConfig'
import type { TrackerTask } from '../types/tracker'
import { getNotCompletedDestination } from '../utils/completed/notCompletedNavigation'
import { markTaskNotCompletedOnApi } from '../utils/completed/markTaskNotCompletedOnApi'
import { notifyTasksChanged } from '../utils/taskEvents'

export function useMarkTaskNotCompleted() {
  const navigate = useNavigate()
  const { patchTask, reloadTasks } = useTaskFlow()
  const useApi = isBackendAuthEnabled()
  const [busyTaskId, setBusyTaskId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const markNotCompleted = useCallback(
    async (task: TrackerTask) => {
      if (busyTaskId != null) return
      if (task.workflowStatus !== 'completed' && task.status !== 'completed') {
        setError('Only completed tasks can be marked as not completed.')
        return
      }

      setBusyTaskId(task.id)
      setError(null)

      try {
        if (useApi) {
          await markTaskNotCompletedOnApi(task)
          notifyTasksChanged()
          await reloadTasks()
        } else {
          patchTask(task.id, {
            workflowStatus: 'not_started',
            status: 'upcoming',
            progressPercent: 0,
            startedAt: undefined,
            completedAt: undefined,
            pauseReason: undefined,
            scheduledResumeAt: undefined,
          })
          notifyTasksChanged()
        }

        navigate(getNotCompletedDestination(task.date))
      } catch (err) {
        if (err instanceof ApiError) {
          setError(
            err.status === 401
              ? 'Your session expired. Please sign in again.'
              : err.message || 'Could not update this task. Please try again.',
          )
        } else {
          setError('Could not update this task. Please try again.')
        }
      } finally {
        setBusyTaskId(null)
      }
    },
    [busyTaskId, navigate, patchTask, reloadTasks, useApi],
  )

  return {
    markNotCompleted,
    busyTaskId,
    error,
    clearError: () => setError(null),
  }
}
