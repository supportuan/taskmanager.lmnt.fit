import type { CategoryTimePoint } from '../../../types/analytics'
import { formatMinutesCompact } from '../../../utils/analytics/formatting'

interface CategoryTimeChartProps {
  data: CategoryTimePoint[]
}

export function CategoryTimeChart({ data }: CategoryTimeChartProps) {
  const max = Math.max(1, ...data.map((d) => d.actualMinutes))
  const top = data.slice(0, 6)

  if (top.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-muted">No category time data yet.</p>
    )
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Time by category">
      {top.map((row, idx) => {
        const pct = (row.actualMinutes / max) * 100
        return (
          <li key={row.category} className="min-w-0">
            <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
              <span className="truncate font-medium text-text-secondary">{row.category}</span>
              <span className="shrink-0 text-text-muted">
                {formatMinutesCompact(row.actualMinutes)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, #208CFF ${100 - idx * 8}%, #7B4DFF)`,
                  boxShadow: '0 0 12px rgba(37,200,255,0.25)',
                }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
