import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PauseTaskFormValues } from '../components/tracker/PauseTaskModal'
import { useTaskFlow } from '../context/TaskFlowContext'
import type { PauseTaskPayload } from '../types/tracker'
import { appendFocusSession } from '../utils/focusSessions'
import { resolveFocusCurrentTask, resolveFocusNextTask } from '../utils/focusUtils'
import { scheduledResumeAtFromLocal } from '../utils/tracker/scheduledResumeUtils'
import {
  computeElapsedSeconds,
  progressForTask,
} from '../utils/tracker/trackerExecution'
import { useFocusTimer } from './useFocusTimer'

export function useFocusMode() {
  const {
    tasks,
    tasksLoading,
    tasksLoadError,
    reloadTasks,
    startTaskExecution,
    pauseTaskExecution,
    resumeTaskExecution,
    requestTaskCompletion,
    pendingCompletion,
    cancelTaskCompletion,
    commitTaskCompletion,
    executionBusy,
  } = useTaskFlow()

  const focusTimer = useFocusTimer()
  const sessionStartedAtRef = useRef<string | null>(null)
  const sessionLoggedRef = useRef(false)
  const [pauseModalOpen, setPauseModalOpen] = useState(false)
  const [executionError, setExecutionError] = useState<string | null>(null)
  const [timerTick, setTimerTick] = useState(0)
  const [retrying, setRetrying] = useState(false)
  /** Explicit UI mode: task countdown vs Pomodoro (not inferred from task status alone). */
  const [taskAwareSession, setTaskAwareSession] = useState<{
    active: boolean
    taskId: number | null
  }>({ active: false, taskId: null })

  const currentTask = useMemo(() => resolveFocusCurrentTask(tasks), [tasks])
  const nextTask = useMemo(() => resolveFocusNextTask(tasks, currentTask), [tasks, currentTask])

  const useTaskAwareDisplay = Boolean(
    taskAwareSession.active &&
      taskAwareSession.taskId != null &&
      currentTask &&
      currentTask.id === taskAwareSession.taskId &&
      focusTimer.mode === 'focus' &&
      currentTask.workflowStatus === 'in_progress',
  )

  useEffect(() => {
    if (!taskAwareSession.active || taskAwareSession.taskId == null) return
    const bound = tasks.find((t) => t.id === taskAwareSession.taskId)
    if (
      !bound ||
      bound.workflowStatus === 'completed' ||
      currentTask?.id !== taskAwareSession.taskId
    ) {
      setTaskAwareSession({ active: false, taskId: null })
    }
  }, [tasks, taskAwareSession.active, taskAwareSession.taskId, currentTask?.id])

  useEffect(() => {
    const taskRunning = currentTask?.workflowStatus === 'in_progress'
    const pomodoroRunning = focusTimer.isRunning && !useTaskAwareDisplay
    if (!taskRunning && !pomodoroRunning) return
    const id = window.setInterval(() => setTimerTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [
    currentTask?.workflowStatus,
    currentTask?.id,
    focusTimer.isRunning,
    useTaskAwareDisplay,
    focusTimer.mode,
  ])

  const displayElapsed = currentTask ? computeElapsedSeconds(currentTask) : 0
  void timerTick

  const displayProgress = currentTask ? progressForTask(currentTask) : 0

  const plannedSeconds = Math.max(0, (currentTask?.durationMinutes ?? 0) * 60)
  const remainingTaskSeconds = Math.max(0, plannedSeconds - displayElapsed)

  const timerRemaining = useTaskAwareDisplay
    ? remainingTaskSeconds
    : focusTimer.remainingSeconds
  const timerDuration = useTaskAwareDisplay
    ? Math.max(plannedSeconds, 1)
    : focusTimer.durationSeconds
  const timerRunning = useTaskAwareDisplay
    ? currentTask!.workflowStatus === 'in_progress'
    : focusTimer.isRunning
  const timerProgressRatio = useTaskAwareDisplay
    ? plannedSeconds > 0
      ? Math.min(1, displayElapsed / plannedSeconds)
      : 0
    : focusTimer.progressRatio
  const timerSessionComplete = useTaskAwareDisplay ? false : focusTimer.sessionComplete

  const headerFocusRunning = useTaskAwareDisplay
    ? currentTask!.workflowStatus === 'in_progress'
    : focusTimer.isRunning && focusTimer.mode === 'focus'

  const headerFocusPaused =
    !useTaskAwareDisplay &&
    !focusTimer.isRunning &&
    !focusTimer.sessionComplete &&
    focusTimer.mode === 'focus' &&
    focusTimer.remainingSeconds < focusTimer.durationSeconds &&
    focusTimer.remainingSeconds > 0

  const exitTaskAwareTimer = useCallback(() => {
    setTaskAwareSession({ active: false, taskId: null })
  }, [])

  const startTask = useCallback(async () => {
    if (!currentTask || executionBusy) return
    setExecutionError(null)
    focusTimer.setMode('focus')
    if (focusTimer.isRunning) focusTimer.pause()
    const result = await startTaskExecution(currentTask.id)
    if (result.ok) {
      setTaskAwareSession({ active: true, taskId: currentTask.id })
    } else {
      setExecutionError(result.message)
    }
  }, [currentTask, executionBusy, focusTimer, startTaskExecution])

  const openPauseModal = useCallback(() => {
    if (!currentTask || currentTask.workflowStatus !== 'in_progress' || executionBusy) return
    setExecutionError(null)
    setPauseModalOpen(true)
  }, [currentTask, executionBusy])

  const cancelPauseModal = useCallback(() => {
    if (executionBusy) return
    setPauseModalOpen(false)
  }, [executionBusy])

  const confirmPause = useCallback(
    async (values: PauseTaskFormValues) => {
      if (!currentTask || executionBusy) return
      const scheduledResumeAt = scheduledResumeAtFromLocal(
        values.resumeDateIso,
        values.resumeTime24,
      )
      if (!scheduledResumeAt) {
        setExecutionError('Enter a valid resume date and time.')
        return
      }
      const pause: PauseTaskPayload = {
        pauseReason: values.pauseReason,
        scheduledResumeAt,
      }
      setExecutionError(null)
      const elapsed = computeElapsedSeconds(currentTask)
      const result = await pauseTaskExecution(currentTask.id, elapsed, pause)
      if (result.ok) {
        setPauseModalOpen(false)
        exitTaskAwareTimer()
        if (focusTimer.isRunning) focusTimer.pause()
      } else {
        setExecutionError(result.message)
      }
    },
    [currentTask, executionBusy, exitTaskAwareTimer, focusTimer, pauseTaskExecution],
  )

  const resumeTask = useCallback(async () => {
    if (!currentTask || executionBusy) return
    setExecutionError(null)
    focusTimer.setMode('focus')
    if (focusTimer.isRunning) focusTimer.pause()
    const result = await resumeTaskExecution(currentTask.id)
    if (result.ok) {
      setTaskAwareSession({ active: true, taskId: currentTask.id })
    } else {
      setExecutionError(result.message)
    }
  }, [currentTask, executionBusy, focusTimer, resumeTaskExecution])

  const startFocus = useCallback(() => {
    if (useTaskAwareDisplay) return
    if (focusTimer.sessionComplete) {
      focusTimer.dismissSessionComplete()
      sessionLoggedRef.current = false
    }
    const atFullDuration =
      focusTimer.remainingSeconds >= focusTimer.durationSeconds - 1
    if (!focusTimer.isRunning && (atFullDuration || !sessionStartedAtRef.current)) {
      sessionStartedAtRef.current = new Date().toISOString()
      sessionLoggedRef.current = false
    }
    focusTimer.start()
  }, [focusTimer, useTaskAwareDisplay])

  const pauseFocus = useCallback(() => {
    if (useTaskAwareDisplay && currentTask?.workflowStatus === 'in_progress') {
      openPauseModal()
      return
    }
    focusTimer.pause()
  }, [currentTask?.workflowStatus, focusTimer, openPauseModal, useTaskAwareDisplay])

  const resumeFocus = useCallback(() => {
    focusTimer.start()
  }, [focusTimer])

  const resetFocus = useCallback(() => {
    if (useTaskAwareDisplay) return
    focusTimer.reset()
    sessionStartedAtRef.current = null
    sessionLoggedRef.current = false
  }, [focusTimer, useTaskAwareDisplay])

  useEffect(() => {
    if (useTaskAwareDisplay) return
    if (!focusTimer.sessionComplete || sessionLoggedRef.current) return
    if (!sessionStartedAtRef.current) return
    sessionLoggedRef.current = true
    appendFocusSession({
      taskId: currentTask?.id ?? null,
      mode: focusTimer.mode,
      startedAt: sessionStartedAtRef.current,
      endedAt: new Date().toISOString(),
      plannedDurationSeconds: focusTimer.durationSeconds,
      actualDurationSeconds: focusTimer.durationSeconds,
    })
    sessionStartedAtRef.current = null
  }, [
    focusTimer.sessionComplete,
    focusTimer.mode,
    focusTimer.durationSeconds,
    currentTask?.id,
    useTaskAwareDisplay,
  ])

  const requestComplete = useCallback(() => {
    if (!currentTask || executionBusy) return
    if (focusTimer.isRunning && !useTaskAwareDisplay) focusTimer.pause()
    requestTaskCompletion({
      taskId: currentTask.id,
      elapsedSeconds: computeElapsedSeconds(currentTask),
      selectedIso: currentTask.date,
    })
  }, [currentTask, executionBusy, focusTimer, requestTaskCompletion, useTaskAwareDisplay])

  const finalizeComplete = useCallback(
    async (reflection: Parameters<typeof commitTaskCompletion>[0]) => {
      setExecutionError(null)
      const result = await commitTaskCompletion(reflection)
      if (!result.ok) {
        setExecutionError(result.message)
        return
      }
      exitTaskAwareTimer()
      focusTimer.reset()
      sessionStartedAtRef.current = null
      sessionLoggedRef.current = false
    },
    [commitTaskCompletion, exitTaskAwareTimer, focusTimer],
  )

  const pendingTask = useMemo(() => {
    if (!pendingCompletion) return undefined
    return tasks.find((t) => t.id === pendingCompletion.taskId)
  }, [pendingCompletion, tasks])

  const hasOpenTasks = useMemo(
    () =>
      tasks.some(
        (t) => t.workflowStatus !== 'completed' && t.workflowStatus !== 'overdue',
      ),
    [tasks],
  )

  const handleRetryLoad = useCallback(async () => {
    setRetrying(true)
    try {
      await reloadTasks()
    } finally {
      setRetrying(false)
    }
  }, [reloadTasks])

  const onModeChange = useCallback(
    (mode: Parameters<typeof focusTimer.setMode>[0]) => {
      if (mode !== 'focus') exitTaskAwareTimer()
      focusTimer.setMode(mode)
    },
    [exitTaskAwareTimer, focusTimer],
  )

  return {
    currentTask,
    nextTask,
    displayElapsed,
    displayProgress,
    remainingTaskSeconds,
    plannedSeconds,
    focusTimer,
    useTaskAwareDisplay,
    timerRemaining,
    timerDuration,
    timerRunning,
    timerProgressRatio,
    timerSessionComplete,
    headerFocusRunning,
    headerFocusPaused,
    startFocus,
    pauseFocus,
    resumeFocus,
    resetFocus,
    startTask,
    resumeTask,
    openPauseModal,
    requestComplete,
    finalizeComplete,
    cancelTaskCompletion,
    pendingTask,
    pauseModalOpen,
    cancelPauseModal,
    confirmPause,
    executionError,
    executionBusy,
    tasksLoading,
    tasksLoadError,
    hasOpenTasks,
    retrying,
    handleRetryLoad,
    onModeChange,
  }
}
