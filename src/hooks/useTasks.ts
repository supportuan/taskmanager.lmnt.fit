import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ApiError } from '../services/api'
import { getTasks, type TaskApiRecord } from '../services/taskService'
import type { ScheduleViewMode, Task, TaskStatus } from '../types/task'
import { computeDashboardMetrics } from '../utils/dashboard/dashboardMetrics'
import { mapApiTaskToDashboardTask } from '../utils/dashboard/mapApiTaskToDashboard'
import { formatISODate, parseTimeOnDate } from '../utils/dateUtils'
import { TASKFLOW_TASKS_CHANGED_EVENT } from '../utils/taskEvents'

function sortByStartTime(a: Task, b: Task): number {
  const da = parseTimeOnDate(a.date, a.startTime).getTime()
  const db = parseTimeOnDate(b.date, b.startTime).getTime()
  return da - db
}

export function useTasks(selectedDateIso: string) {
  const location = useLocation()
  const [apiTasks, setApiTasks] = useState<TaskApiRecord[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined)
  const [scheduleMode, setScheduleMode] = useState<ScheduleViewMode>('hours')

  useEffect(() => {
    const todayIso = formatISODate(new Date())
    if (selectedDateIso !== todayIso) {
      setScheduleMode('tasks')
    }
  }, [selectedDateIso])

  const reloadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const records = await getTasks()
      setApiTasks(records)
      setTasks(records.map(mapApiTaskToDashboardTask))
    } catch (err) {
      setApiTasks([])
      setTasks([])
      if (err instanceof ApiError) {
        if (err.status === 401) return
        setError(err.message)
      } else {
        setError('Unable to load your tasks. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reloadTasks()
  }, [reloadTasks, location.key])

  useEffect(() => {
    const onFocus = () => {
      void reloadTasks()
    }
    const onTasksChanged = () => {
      void reloadTasks()
    }
    window.addEventListener('focus', onFocus)
    window.addEventListener(TASKFLOW_TASKS_CHANGED_EVENT, onTasksChanged)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener(TASKFLOW_TASKS_CHANGED_EVENT, onTasksChanged)
    }
  }, [reloadTasks])

  const productivityStats = useMemo(
    () => computeDashboardMetrics(apiTasks),
    [apiTasks],
  )

  const tasksForSelectedDate = useMemo(
    () => tasks.filter((t) => t.date === selectedDateIso).sort(sortByStartTime),
    [tasks, selectedDateIso],
  )

  const scheduleItems = useMemo(() => {
    const now = new Date()
    const isSelectedToday = selectedDateIso === formatISODate(now)

    if (scheduleMode === 'tasks') {
      return tasksForSelectedDate
        .filter((t) => t.status !== 'completed')
        .slice(0, 6)
    }

    if (!isSelectedToday) {
      return tasksForSelectedDate.filter((t) => t.status !== 'completed').slice(0, 6)
    }

    const windowEnd = new Date(now.getTime() + 6 * 60 * 60 * 1000)

    let filtered = tasksForSelectedDate
      .filter((task) => {
        if (task.status === 'completed') return false
        const start = parseTimeOnDate(task.date, task.startTime)
        return start >= now && start <= windowEnd
      })
      .sort(sortByStartTime)

    if (filtered.length === 0) {
      filtered = tasksForSelectedDate
        .filter((t) => t.status !== 'completed')
        .filter((task) => parseTimeOnDate(task.date, task.startTime) >= now)
        .sort(sortByStartTime)
        .slice(0, 6)
    }

    if (filtered.length === 0) {
      filtered = tasksForSelectedDate.sort(sortByStartTime).slice(0, 6)
    }

    return filtered
  }, [tasksForSelectedDate, scheduleMode, selectedDateIso])

  useEffect(() => {
    if (tasksForSelectedDate.length === 0) {
      setSelectedTaskId(undefined)
      return
    }
    const existsOnDate = tasksForSelectedDate.some((t) => t.id === selectedTaskId)
    if (!existsOnDate) {
      const current =
        tasksForSelectedDate.find(
          (t) => t.status === 'current' || t.status === 'in_progress',
        ) ?? tasksForSelectedDate[0]
      setSelectedTaskId(current?.id)
    }
  }, [selectedDateIso, tasksForSelectedDate, selectedTaskId])

  const selectedTask = useMemo(() => {
    if (tasks.length === 0) return undefined
    if (selectedTaskId != null) {
      return tasks.find((t) => t.id === selectedTaskId) ?? tasksForSelectedDate[0]
    }
    return tasksForSelectedDate[0]
  }, [tasks, selectedTaskId, tasksForSelectedDate])

  const currentTask = useMemo(
    () =>
      tasks.find((t) => t.status === 'current' || t.status === 'in_progress') ??
      tasks.find((t) => t.status !== 'completed'),
    [tasks],
  )

  const selectTask = useCallback((id: number) => {
    setSelectedTaskId(id)
  }, [])

  const startTask = useCallback((id: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          return { ...task, status: 'current' as TaskStatus }
        }
        if (task.status === 'current' || task.status === 'in_progress') {
          return { ...task, status: 'upcoming' as TaskStatus }
        }
        return task
      }),
    )
    setSelectedTaskId(id)
  }, [])

  return {
    tasks,
    tasksForSelectedDate,
    scheduleItems,
    scheduleMode,
    setScheduleMode,
    selectedTask,
    selectedTaskId,
    currentTask,
    selectTask,
    startTask,
    productivityStats,
    loading,
    error,
    reloadTasks,
  }
}
