import { parseISODate } from '../dateUtils'

/** Evenly spaced x-axis tick indices so labels never crowd (30d / custom ranges). */
export function axisTickIndices(length: number, maxTicks = 7): number[] {
  if (length <= 0) return []
  if (length <= maxTicks) {
    return Array.from({ length }, (_, i) => i)
  }
  const ticks: number[] = [0]
  const slots = maxTicks - 1
  for (let k = 1; k < slots; k++) {
    ticks.push(Math.round((k / slots) * (length - 1)))
  }
  ticks.push(length - 1)
  return [...new Set(ticks)].sort((a, b) => a - b)
}

export function maxAxisTicksForSeries(length: number): number {
  if (length <= 7) return length
  if (length <= 14) return 7
  if (length <= 31) return 6
  return 5
}

export function chartAxisDateLabel(iso: string, fallbackLabel?: string): string {
  const trimmed = fallbackLabel?.trim()
  if (trimmed && !trimmed.includes('–')) return trimmed
  const d = parseISODate(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function shouldShowAxisTick(index: number, length: number): boolean {
  return axisTickIndices(length, maxAxisTicksForSeries(length)).includes(index)
}

export function axisLabelForPoint(
  index: number,
  length: number,
  iso: string,
  fallbackLabel?: string,
): string | null {
  if (!shouldShowAxisTick(index, length)) return null
  return chartAxisDateLabel(iso, fallbackLabel)
}
