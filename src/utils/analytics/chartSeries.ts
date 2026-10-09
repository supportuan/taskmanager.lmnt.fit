import type { DailyCompletionPoint, DailyTimePoint } from '../../types/analytics'
import { chartAxisDateLabel } from './chartAxisTicks'

const MAX_CHART_POINTS = 31

function bucketSize(length: number): number {
  return Math.max(1, Math.ceil(length / MAX_CHART_POINTS))
}

/** Keeps metrics on full daily data; charts downsample very wide custom ranges. */
export function chartCompletionSeries(data: DailyCompletionPoint[]): DailyCompletionPoint[] {
  if (data.length <= MAX_CHART_POINTS) return data
  const size = bucketSize(data.length)
  const out: DailyCompletionPoint[] = []
  for (let i = 0; i < data.length; i += size) {
    const chunk = data.slice(i, i + size)
    const plannedTasks = chunk.reduce((s, d) => s + d.plannedTasks, 0)
    const completedTasks = chunk.reduce((s, d) => s + d.completedTasks, 0)
    const last = chunk[chunk.length - 1]
    out.push({
      date: last.date,
      label: chartAxisDateLabel(last.date, chunk.length > 1 ? undefined : last.label),
      plannedTasks,
      completedTasks,
      completionRate:
        plannedTasks > 0 ? Math.min(100, (completedTasks / plannedTasks) * 100) : 0,
    })
  }
  return out
}

export function chartTimeSeries(data: DailyTimePoint[]): DailyTimePoint[] {
  if (data.length <= MAX_CHART_POINTS) return data
  const size = bucketSize(data.length)
  const out: DailyTimePoint[] = []
  for (let i = 0; i < data.length; i += size) {
    const chunk = data.slice(i, i + size)
    const last = chunk[chunk.length - 1]
    out.push({
      date: last.date,
      label: chartAxisDateLabel(last.date, chunk.length > 1 ? undefined : last.label),
      plannedMinutes: chunk.reduce((s, d) => s + d.plannedMinutes, 0),
      actualMinutes: chunk.reduce((s, d) => s + d.actualMinutes, 0),
    })
  }
  return out
}
