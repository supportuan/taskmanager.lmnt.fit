import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTaskFlow } from '../context/TaskFlowContext'
import type { PauseTaskPayload, TrackerTask } from '../types/tracker'
import { formatISODate, parseISODate } from '../utils/dateUtils'
import { scheduledResumeAtFromLocal } from '../utils/tracker/scheduledResumeUtils'
import {
  computeElapsedSeconds,
  findActiveTaskId,
  progressForTask,
} from '../utils/tracker/trackerExecution'
import {
  completedTasksForDate,
  nextIncompleteTasks,
  sortTasksByStart,
  tasksForDate,
} from '../utils/trackerUtils'
import type { PauseTaskFormValues } from '../components/tracker/PauseTaskModal'

function findInitialCurrentId(tasks: TrackerTask[]): number {
  const active = findActiveTaskId(tasks)
  if (active != null) return active
  const next = sortTasksByStart(tasks).find((t) => t.workflowStatus !== 'completed')
  return next?.id ?? tasks[0]?.id ?? 0
}

export function useTaskTracker(searchQuery: string) {
  const {
    tasks,
    startTaskExecution,
    pauseTaskExecution,
    resumeTaskExecution,
    completeTaskByDrag,
    requestTaskCompletion,
    pendingCompletion,
    cancelTaskCompletion,
    commitTaskCompletion,
    executionBusy,
  } = useTaskFlow()

  const [pauseModalOpen, setPauseModalOpen] = useState(false)
  const [executionError, setExecutionError] = useState<string | null>(null)
  const [timerTick, setTimerTick] = useState(0)

  const [selectedIso, setSelectedIso] = useState(() => formatISODate(new Date()))
  const [currentTaskId, setCurrentTaskId] = useState(() => findInitialCurrentId(tasks))

  const dayTasks = useMemo(() => tasksForDate(tasks, selectedIso), [tasks, selectedIso])

  const currentTask = useMemo(() => {
    const activeOnDay = dayTasks.find((t) => t.workflowStatus === 'in_progress')
    if (activeOnDay) return activeOnDay
    return dayTasks.find((t) => t.id === currentTaskId) ?? dayTasks[0]
  }, [dayTasks, currentTaskId])

  const isTimerRunning = currentTask?.workflowStatus === 'in_progress'

  useEffect(() => {
    if (!isTimerRunning) return
    const id = window.setInterval(() => setTimerTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [isTimerRunning, currentTask?.id])

  const displayElapsed = currentTask ? computeElapsedSeconds(currentTask) : 0

  const displayProgress = currentTask ? progressForTask(currentTask) : 0

  void timerTick

  const filteredDayTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return dayTasks
    return dayTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)),
    )
  }, [dayTasks, searchQuery])

  const nextSix = useMemo(
    () => nextIncompleteTasks(filteredDayTasks, 6),
    [filteredDayTasks],
  )

  const completedForDay = useMemo(
    () => completedTasksForDate(filteredDayTasks, selectedIso),
    [filteredDayTasks, selectedIso],
  )

  const timelineTasks = useMemo(() => sortTasksByStart(filteredDayTasks), [filteredDayTasks])

  const selectTask = useCallback((id: number) => {
    setExecutionError(null)
    setCurrentTaskId(id)
  }, [])

  const startTask = useCallback(async () => {
    if (!currentTask || executionBusy) return
    setExecutionError(null)
    const result = await startTaskExecution(currentTask.id)
    if (!result.ok) setExecutionError(result.message)
  }, [currentTask, executionBusy, startTaskExecution])

  const openPauseModal = useCallback(() => {
    if (!currentTask || currentTask.workflowStatus !== 'in_progress') return
    setExecutionError(null)
    setPauseModalOpen(true)
  }, [currentTask])

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
      } else {
        setExecutionError(result.message)
      }
    },
    [currentTask, executionBusy, pauseTaskExecution],
  )

  const resumeTask = useCallback(async () => {
    if (!currentTask || executionBusy) return
    setExecutionError(null)
    const result = await resumeTaskExecution(currentTask.id)
    if (!result.ok) setExecutionError(result.message)
  }, [currentTask, executionBusy, resumeTaskExecution])

  const requestComplete = useCallback(() => {
    if (!currentTask) return
    requestTaskCompletion({
      taskId: currentTask.id,
      elapsedSeconds: computeElapsedSeconds(currentTask),
      selectedIso,
    })
  }, [currentTask, requestTaskCompletion, selectedIso])

  const finalizeComplete = useCallback(
    async (reflection: Parameters<typeof commitTaskCompletion>[0]) => {
      setExecutionError(null)
      const result = await commitTaskCompletion(reflection)
      if (!result.ok) {
        setExecutionError(result.message)
        return
      }
      if (result.nextTaskId != null) {
        setCurrentTaskId(result.nextTaskId)
      }
    },
    [commitTaskCompletion],
  )

  const skipTask = useCallback(() => {
    const list = sortTasksByStart(dayTasks.filter((t) => t.workflowStatus !== 'completed'))
    const idx = list.findIndex((t) => t.id === currentTaskId)
    const next = list[idx + 1] ?? list[0]
    if (next && next.id !== currentTaskId) setCurrentTaskId(next.id)
  }, [currentTaskId, dayTasks])

  const goPrevDay = useCallback(() => {
    setSelectedIso((iso) => {
      const d = parseISODate(iso)
      d.setDate(d.getDate() - 1)
      return formatISODate(d)
    })
  }, [])

  const goNextDay = useCallback(() => {
    setSelectedIso((iso) => {
      const d = parseISODate(iso)
      d.setDate(d.getDate() + 1)
      return formatISODate(d)
    })
  }, [])

  const goToday = useCallback(() => setSelectedIso(formatISODate(new Date())), [])

  useEffect(() => {
    const activeOnDay = dayTasks.find((t) => t.workflowStatus === 'in_progress')
    if (activeOnDay) {
      setCurrentTaskId(activeOnDay.id)
      return
    }
    const exists = dayTasks.some((t) => t.id === currentTaskId)
    if (!exists && dayTasks[0]) setCurrentTaskId(dayTasks[0].id)
  }, [selectedIso, dayTasks, currentTaskId])

  useEffect(() => {
    const active = findActiveTaskId(tasks)
    if (active != null && tasks.find((t) => t.id === active)?.date === selectedIso) {
      setCurrentTaskId(active)
    }
  }, [tasks, selectedIso])

  const pendingTask = useMemo(() => {
    if (!pendingCompletion) return undefined
    return tasks.find((t) => t.id === pendingCompletion.taskId)
  }, [pendingCompletion, tasks])

  const completeTaskFromDrag = useCallback(
    (taskId: number) => completeTaskByDrag(taskId, selectedIso),
    [completeTaskByDrag, selectedIso],
  )

  return {
    selectedIso,
    setSelectedIso,
    currentTask,
    currentTaskId: currentTask?.id,
    displayElapsed,
    displayProgress,
    nextSix,
    completedForDay,
    completeTaskFromDrag,
    timelineTasks,
    goPrevDay,
    goNextDay,
    goToday,
    selectTask,
    startTask,
    openPauseModal,
    cancelPauseModal,
    confirmPause,
    pauseModalOpen,
    resumeTask,
    requestComplete,
    finalizeComplete,
    cancelTaskCompletion,
    pendingTask,
    skipTask,
    executionError,
    executionBusy,
  }
}
