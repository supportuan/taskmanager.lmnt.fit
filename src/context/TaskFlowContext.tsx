import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import { createInitialTasks } from '../data/initialTasksData'
import { ApiError } from '../services/api'
import { isBackendAuthEnabled } from '../services/auth/authConfig'
import { getTasks } from '../services/taskService'
import type {
  PauseTaskPayload,
  TaskCompletionReflection,
  TrackerTask,
} from '../types/tracker'
import {
  applyCompletionToTasks,
  promoteNextTaskAfterComplete,
} from '../utils/taskCompletion'
import { notifyTasksChanged, TASKFLOW_TASKS_CHANGED_EVENT } from '../utils/taskEvents'
import {
  completeTaskOnApi,
  mergeCompletedApiResponse,
} from '../utils/tracker/completeTaskOnApi'
import { mapApiTaskToTrackerTask } from '../utils/tracker/mapApiTaskToTracker'
import { persistTrackerTask } from '../utils/tracker/persistTrackerTask'
import {
  actualDurationMinutesFromElapsed,
  computeElapsedSeconds,
  progressForTask,
} from '../utils/tracker/trackerExecution'
import { useAuth } from './AuthContext'

const LEGACY_STORAGE_KEY = 'taskflow-tasks-v1'

export interface PendingCompletion {
  taskId: number
  elapsedSeconds: number
  selectedIso: string
}

function tasksLoadErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 401) return ''
  return 'Unable to load your tasks. Please try again.'
}

interface TaskFlowContextValue {
  tasks: TrackerTask[]
  tasksLoading: boolean
  /** User-friendly message when GET /api/tasks fails (empty when no error). */
  tasksLoadError: string | null
  executionBusy: boolean
  patchTask: (id: number, patch: Partial<TrackerTask>) => void
  startTaskExecution: (taskId: number) => Promise<{ ok: true } | { ok: false; message: string }>
  pauseTaskExecution: (
    taskId: number,
    elapsedSeconds: number,
    pause: PauseTaskPayload,
  ) => Promise<{ ok: true } | { ok: false; message: string }>
  resumeTaskExecution: (taskId: number) => Promise<{ ok: true } | { ok: false; message: string }>
  completeTaskByDrag: (
    taskId: number,
    selectedIso: string,
  ) => { ok: true } | { ok: false; message: string }
  pendingCompletion: PendingCompletion | null
  requestTaskCompletion: (payload: PendingCompletion) => void
  cancelTaskCompletion: () => void
  commitTaskCompletion: (
    reflection: TaskCompletionReflection & { skipReflection?: boolean },
  ) => Promise<{ ok: true; nextTaskId: number | null } | { ok: false; message: string }>
  reloadTasks: () => Promise<void>
}

const TaskFlowContext = createContext<TaskFlowContextValue | null>(null)

function loadLegacyStoredTasks(): TrackerTask[] {
  const seed = createInitialTasks()
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return seed
    const parsed = JSON.parse(raw) as TrackerTask[]
    if (!Array.isArray(parsed) || parsed.length === 0) return seed
    const byId = new Map(parsed.map((t) => [t.id, t]))
    for (const task of seed) {
      if (!byId.has(task.id)) byId.set(task.id, task)
    }
    return [...byId.values()]
  } catch {
    return seed
  }
}

function applyLocalPatch(tasks: TrackerTask[], id: number, patch: Partial<TrackerTask>): TrackerTask[] {
  return tasks.map((t) => (t.id === id ? { ...t, ...patch } : t))
}

export function TaskFlowProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const userId = user?.id != null ? String(user.id) : null
  const useApiTasks = isBackendAuthEnabled() && isAuthenticated && userId != null

  const [tasks, setTasks] = useState<TrackerTask[]>(() =>
    useApiTasks ? [] : loadLegacyStoredTasks(),
  )
  const [tasksLoading, setTasksLoading] = useState(() => isBackendAuthEnabled())
  const [tasksLoadError, setTasksLoadError] = useState<string | null>(null)
  const [executionBusy, setExecutionBusy] = useState(false)
  const [pendingCompletion, setPendingCompletion] = useState<PendingCompletion | null>(null)

  useEffect(() => {
    if (useApiTasks) return
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks, useApiTasks])

  const reloadTasks = useCallback(async () => {
    if (!useApiTasks || !userId) return
    setTasksLoading(true)
    setTasksLoadError(null)
    try {
      const records = await getTasks()
      setTasks(records.map(mapApiTaskToTrackerTask))
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setTasks([])
        setTasksLoadError(null)
        return
      }
      const message = tasksLoadErrorMessage(err)
      if (message) setTasksLoadError(message)
    } finally {
      setTasksLoading(false)
    }
  }, [useApiTasks, userId])

  useEffect(() => {
    if (!useApiTasks) {
      setTasks(loadLegacyStoredTasks())
      setTasksLoading(false)
      setTasksLoadError(null)
      return
    }
    void reloadTasks()
  }, [useApiTasks, userId, location.key, reloadTasks])

  useEffect(() => {
    if (!useApiTasks) return
    const onFocus = () => {
      void reloadTasks().catch(() => undefined)
    }
    const onTasksChanged = () => {
      void reloadTasks().catch(() => undefined)
    }
    window.addEventListener('focus', onFocus)
    window.addEventListener(TASKFLOW_TASKS_CHANGED_EVENT, onTasksChanged)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener(TASKFLOW_TASKS_CHANGED_EVENT, onTasksChanged)
    }
  }, [useApiTasks, reloadTasks])

  const patchTask = useCallback((id: number, patch: Partial<TrackerTask>) => {
    setTasks((prev) => applyLocalPatch(prev, id, patch))
  }, [])

  const withPersist = useCallback(
    async (
      taskId: number,
      buildNext: (task: TrackerTask) => TrackerTask,
    ): Promise<{ ok: true } | { ok: false; message: string }> => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return { ok: false, message: 'Task not found.' }

      if (!useApiTasks) {
        const next = buildNext(task)
        setTasks((prev) => applyLocalPatch(prev, taskId, next))
        return { ok: true }
      }

      const snapshot = tasks
      const optimistic = buildNext(task)
      setTasks((prev) => applyLocalPatch(prev, taskId, optimistic))
      setExecutionBusy(true)
      try {
        const result = await persistTrackerTask(optimistic)
        if (!result.ok) {
          setTasks(snapshot)
          return { ok: false, message: result.message }
        }
        setTasks((prev) => applyLocalPatch(prev, taskId, result.task))
        notifyTasksChanged()
        return { ok: true }
      } finally {
        setExecutionBusy(false)
      }
    },
    [tasks, useApiTasks],
  )

  const startTaskExecution = useCallback(
    async (taskId: number) => {
      return withPersist(taskId, (task) => {
        const now = new Date().toISOString()
        const baseMinutes =
          task.workflowStatus === 'not_started' ? 0 : (task.actualDurationMinutes ?? 0)
        const draft: TrackerTask = {
          ...task,
          workflowStatus: 'in_progress',
          status: 'current',
          startedAt: now,
          actualDurationMinutes: baseMinutes,
          elapsedSeconds: baseMinutes * 60,
        }
        return {
          ...draft,
          progressPercent: progressForTask(draft),
        }
      })
    },
    [withPersist],
  )

  const pauseTaskExecution = useCallback(
    async (taskId: number, elapsedSeconds: number, pause: PauseTaskPayload) => {
      return withPersist(taskId, (task) => {
        const actualDurationMinutes = actualDurationMinutesFromElapsed(elapsedSeconds)
        const progress = progressForTask({
          ...task,
          elapsedSeconds,
          actualDurationMinutes,
          startedAt: undefined,
          workflowStatus: 'paused',
        })
        return {
          ...task,
          workflowStatus: 'paused',
          status: 'in_progress',
          startedAt: undefined,
          elapsedSeconds,
          actualDurationMinutes,
          pauseReason: pause.pauseReason,
          scheduledResumeAt: pause.scheduledResumeAt,
          progressPercent: progress,
        }
      })
    },
    [withPersist],
  )

  const resumeTaskExecution = useCallback(
    async (taskId: number) => {
      return withPersist(taskId, (task) => {
        const now = new Date().toISOString()
        const elapsed = computeElapsedSeconds(task)
        const actualDurationMinutes =
          task.actualDurationMinutes ?? actualDurationMinutesFromElapsed(elapsed)
        return {
          ...task,
          workflowStatus: 'in_progress',
          status: 'current',
          startedAt: now,
          elapsedSeconds: elapsed,
          actualDurationMinutes,
          pauseReason: undefined,
          scheduledResumeAt: undefined,
          progressPercent: progressForTask({
            ...task,
            workflowStatus: 'in_progress',
            startedAt: now,
            actualDurationMinutes,
          }),
        }
      })
    },
    [withPersist],
  )

  const requestTaskCompletion = useCallback((payload: PendingCompletion) => {
    setPendingCompletion(payload)
  }, [])

  const completeTaskByDrag = useCallback(
    (taskId: number, selectedIso: string): { ok: true } | { ok: false; message: string } => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task || task.workflowStatus === 'completed') {
        return { ok: false, message: 'Task is not available to complete.' }
      }

      requestTaskCompletion({
        taskId,
        elapsedSeconds: computeElapsedSeconds(task),
        selectedIso,
      })
      return { ok: true }
    },
    [tasks, requestTaskCompletion],
  )

  const cancelTaskCompletion = useCallback(() => {
    setPendingCompletion(null)
  }, [])

  const commitTaskCompletion = useCallback(
    async (
      reflection: TaskCompletionReflection & { skipReflection?: boolean },
    ): Promise<{ ok: true; nextTaskId: number | null } | { ok: false; message: string }> => {
      if (!pendingCompletion) return { ok: false, message: 'No task is pending completion.' }
      const { taskId, elapsedSeconds, selectedIso } = pendingCompletion
      const task = tasks.find((t) => t.id === taskId)
      if (!task) {
        setPendingCompletion(null)
        return { ok: false, message: 'Task not found.' }
      }

      if (!useApiTasks) {
        let nextId: number | null = null
        setTasks((prev) => {
          const updated = applyCompletionToTasks(prev, taskId, elapsedSeconds, reflection)
          nextId = promoteNextTaskAfterComplete(updated, taskId, selectedIso)
          return updated
        })
        setPendingCompletion(null)
        return { ok: true, nextTaskId: nextId }
      }

      const snapshot = tasks
      setExecutionBusy(true)
      try {
        const record = await completeTaskOnApi(task, elapsedSeconds, reflection)
        const merged = mergeCompletedApiResponse(
          buildLocalReflection(task, reflection),
          record,
        )
        let nextId: number | null = null
        setTasks((prev) => {
          const updated = prev.map((t) => (t.id === taskId ? merged : t))
          nextId = promoteNextTaskAfterComplete(updated, taskId, selectedIso)
          return updated
        })
        setPendingCompletion(null)
        notifyTasksChanged()
        return { ok: true, nextTaskId: nextId }
      } catch (err) {
        setTasks(snapshot)
        if (err instanceof ApiError && err.status === 401) {
          return { ok: false, message: 'Your session expired. Please sign in again.' }
        }
        return { ok: false, message: 'Unable to complete task. Please try again.' }
      } finally {
        setExecutionBusy(false)
      }
    },
    [pendingCompletion, tasks, useApiTasks],
  )

  const value = useMemo(
    () => ({
      tasks,
      tasksLoading,
      tasksLoadError,
      executionBusy,
      patchTask,
      startTaskExecution,
      pauseTaskExecution,
      resumeTaskExecution,
      completeTaskByDrag,
      pendingCompletion,
      requestTaskCompletion,
      cancelTaskCompletion,
      commitTaskCompletion,
      reloadTasks,
    }),
    [
      tasks,
      tasksLoading,
      tasksLoadError,
      executionBusy,
      patchTask,
      startTaskExecution,
      pauseTaskExecution,
      resumeTaskExecution,
      completeTaskByDrag,
      pendingCompletion,
      requestTaskCompletion,
      cancelTaskCompletion,
      commitTaskCompletion,
      reloadTasks,
    ],
  )

  return <TaskFlowContext.Provider value={value}>{children}</TaskFlowContext.Provider>
}

function buildLocalReflection(
  task: TrackerTask,
  reflection: TaskCompletionReflection & { skipReflection?: boolean },
): TrackerTask {
  if (reflection.skipReflection) return task
  return {
    ...task,
    completionSummary: reflection.completionSummary?.trim() || task.completionSummary,
    achievement: reflection.achievement?.trim() || task.achievement,
    reflectionNote: reflection.reflectionNote?.trim() || task.reflectionNote,
  }
}

export function useTaskFlow() {
  const ctx = useContext(TaskFlowContext)
  if (!ctx) throw new Error('useTaskFlow must be used within TaskFlowProvider')
  return ctx
}
