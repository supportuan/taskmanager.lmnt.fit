import { formatDuration, formatTimeWorked } from '../dateUtils'

export function formatPercent(value: number | null, fallback = '—'): string {
  if (value == null || !Number.isFinite(value)) return fallback
  return `${Math.round(value)}%`
}

export function formatAverageMinutes(minutes: number | null): string {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return '—'
  if (minutes < 60) return `${Math.round(minutes)}m`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function formatStreakDays(days: number): string {
  if (days <= 0) return '0 days'
  return days === 1 ? '1 day' : `${days} days`
}

export function formatMinutesCompact(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0m'
  if (totalMinutes < 60) return formatDuration(totalMinutes)
  return formatTimeWorked(totalMinutes)
}

export function formatTrendDelta(
  current: number,
  previous: number,
  kind: 'percent' | 'count' | 'minutes',
): { label: string; tone: 'positive' | 'negative' | 'neutral' } | undefined {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return undefined
  const delta = current - previous
  if (Math.abs(delta) < 0.01 && kind === 'percent') return undefined
  if (delta === 0 && kind !== 'percent') return undefined

  const tone =
    kind === 'minutes'
      ? delta >= 0
        ? 'positive'
        : 'negative'
      : delta >= 0
        ? 'positive'
        : 'negative'

  if (kind === 'percent') {
    const sign = delta >= 0 ? '↑' : '↓'
    return { label: `${sign} ${Math.abs(Math.round(delta))}% vs previous period`, tone }
  }
  if (kind === 'count') {
    const sign = delta >= 0 ? '+' : ''
    return { label: `${sign}${delta} vs previous period`, tone }
  }
  const sign = delta >= 0 ? '↑' : '↓'
  const rounded = Math.round(Math.abs(delta))
  const deltaLabel =
    rounded < 60 ? `${rounded} min` : formatMinutesCompact(rounded)
  return {
    label: `${sign} ${deltaLabel} vs previous period`,
    tone,
  }
}
