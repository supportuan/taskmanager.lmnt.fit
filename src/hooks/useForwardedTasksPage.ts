import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../services/api'
import { getTasks } from '../services/taskService'
import type { Task } from '../types/task'
import { mapApiTaskToDashboardTask } from '../utils/dashboard/mapApiTaskToDashboard'
import { completeForwardedTaskOnApi } from '../utils/forwarded/completeForwardedTaskOnApi'
import {
  filterForwardedTasksBySearch,
  getForwardedTasks,
  sortForwardedTasks,
} from '../utils/forwarded/forwardedTaskUtils'
import { notifyTasksChanged, TASKFLOW_TASKS_CHANGED_EVENT } from '../utils/taskEvents'

export type ForwardedSortOrder = 'asc' | 'desc'

export function useForwardedTasksPage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<ForwardedSortOrder>('asc')
  const [completingId, setCompletingId] = useState<number | null>(null)
  const [completeError, setCompleteError] = useState<string | null>(null)

  const reloadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const records = await getTasks()
      setTasks(records.map(mapApiTaskToDashboardTask))
    } catch (err) {
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
  }, [reloadTasks])

  useEffect(() => {
    const onTasksChanged = () => {
      void reloadTasks()
    }
    window.addEventListener(TASKFLOW_TASKS_CHANGED_EVENT, onTasksChanged)
    return () => window.removeEventListener(TASKFLOW_TASKS_CHANGED_EVENT, onTasksChanged)
  }, [reloadTasks])

  const forwardedTasks = useMemo(() => getForwardedTasks(tasks), [tasks])

  const displayedTasks = useMemo(() => {
    const searched = filterForwardedTasksBySearch(forwardedTasks, searchQuery)
    return sortForwardedTasks(searched, sortOrder)
  }, [forwardedTasks, searchQuery, sortOrder])

  const completeTask = useCallback(
    async (task: Task) => {
      setCompleteError(null)
      setCompletingId(task.id)
      try {
        await completeForwardedTaskOnApi(task)
        setTasks((prev) => prev.filter((t) => t.id !== task.id))
        notifyTasksChanged()
        navigate('/completed')
      } catch (err) {
        if (err instanceof ApiError) {
          setCompleteError(err.message)
        } else {
          setCompleteError('Could not complete this task. Please try again.')
        }
      } finally {
        setCompletingId(null)
      }
    },
    [navigate],
  )

  return {
    loading,
    error,
    completeError,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    displayedTasks,
    forwardedCount: forwardedTasks.length,
    completingId,
    completeTask,
    reloadTasks,
  }
}
