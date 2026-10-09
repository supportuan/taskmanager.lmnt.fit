import { useMemo, useState } from 'react'
import { useTaskFlow } from '../context/TaskFlowContext'
import type { CompletedDateFilter } from '../utils/completedMetrics'
import {
  computeMilestones,
  computeStreaks,
  computeTimePerformance,
  filterCompletedByPeriod,
  getCompletedTasks,
  motivationalMessage,
} from '../utils/completedMetrics'

export function useCompletedPage(searchQuery: string) {
  const { tasks } = useTaskFlow()
  const [dateFilter, setDateFilter] = useState<CompletedDateFilter>('all')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const allCompleted = useMemo(() => getCompletedTasks(tasks), [tasks])

  const filtered = useMemo(() => {
    let list = filterCompletedByPeriod(tasks, dateFilter)
    const q = searchQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        (t.completionSummary?.toLowerCase().includes(q) ?? false) ||
        (t.achievement?.toLowerCase().includes(q) ?? false),
    )
  }, [tasks, dateFilter, searchQuery])

  const selectedTask = useMemo(() => {
    const pool = filtered.length > 0 ? filtered : allCompleted
    if (pool.length === 0) return undefined
    const id = selectedId ?? pool[0].id
    return pool.find((t) => t.id === id) ?? pool[0]
  }, [filtered, allCompleted, selectedId])

  const performance = useMemo(() => computeTimePerformance(tasks), [tasks])
  const streaks = useMemo(() => computeStreaks(tasks), [tasks])
  const milestones = useMemo(() => computeMilestones(tasks, streaks), [tasks, streaks])
  const motivation = useMemo(
    () => motivationalMessage(streaks, performance),
    [streaks, performance],
  )

  return {
    dateFilter,
    setDateFilter,
    filteredTasks: filtered,
    selectedTask,
    selectTask: setSelectedId,
    performance,
    streaks,
    milestones,
    motivation,
    isEmpty: allCompleted.length === 0,
  }
}
