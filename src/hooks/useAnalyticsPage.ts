import { useMemo, useState } from 'react'
import { useTaskFlow } from '../context/TaskFlowContext'
import type { AnalyticsFilterState, AnalyticsRangePreset } from '../types/analytics'
import { computeAnalytics } from '../utils/analytics/computeAnalytics'
import { applyPreset, defaultAnalyticsFilter } from '../utils/analytics/dateRange'
import { parseISODate } from '../utils/dateUtils'

function clampCustomRange(filter: AnalyticsFilterState): AnalyticsFilterState {
  if (filter.range !== 'custom' || !filter.startDate || !filter.endDate) return filter
  if (filter.startDate <= filter.endDate) return filter
  return { ...filter, startDate: filter.endDate, endDate: filter.startDate }
}

export function useAnalyticsPage() {
  const { tasks, tasksLoading, tasksLoadError, reloadTasks } = useTaskFlow()
  const [filter, setFilterState] = useState<AnalyticsFilterState>(() =>
    defaultAnalyticsFilter(),
  )

  const setFilter = (next: AnalyticsFilterState) => {
    setFilterState(clampCustomRange(next))
  }

  const setRangePreset = (preset: AnalyticsRangePreset) => {
    if (preset === 'custom') {
      setFilter({ ...filter, range: 'custom' })
      return
    }
    setFilter(applyPreset(preset))
  }

  const setCustomDates = (startDate: string, endDate: string) => {
    setFilter({
      range: 'custom',
      startDate,
      endDate,
    })
  }

  const bundle = useMemo(
    () => computeAnalytics(tasks, clampCustomRange(filter)),
    [tasks, filter],
  )

  const customRangeInvalid =
    filter.range === 'custom' &&
    filter.startDate &&
    filter.endDate &&
    filter.startDate > filter.endDate

  return {
    setRangePreset,
    setCustomDates,
    customRangeInvalid: Boolean(customRangeInvalid),
    tasksLoading,
    tasksLoadError,
    retryLoadTasks: reloadTasks,
    showEmpty: !tasksLoading && !tasksLoadError && bundle.isEmpty,
    ...bundle,
    filter,
  }
}

export function analyticsRangeLabel(filter: AnalyticsFilterState): string {
  if (filter.range === 'today') return 'Today'
  if (filter.range === '7d') return '7 Days'
  if (filter.range === '30d') return '30 Days'
  if (filter.range === 'month') return 'This Month'
  if (filter.startDate && filter.endDate) {
    const s = parseISODate(filter.startDate)
    const e = parseISODate(filter.endDate)
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }
  return 'Custom'
}
