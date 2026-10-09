import { BarChart3 } from 'lucide-react'
import type { AnalyticsFilterState, AnalyticsRangePreset } from '../../types/analytics'
import { DateRangeFilter } from './DateRangeFilter'

interface AnalyticsHeaderProps {
  filter: AnalyticsFilterState
  onPreset: (preset: AnalyticsRangePreset) => void
  onCustomDates: (start: string, end: string) => void
  invalidCustom?: boolean
}

export function AnalyticsHeader({
  filter,
  onPreset,
  onCustomDates,
  invalidCustom,
}: AnalyticsHeaderProps) {
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[1fr_minmax(280px,420px)] lg:items-start">
      <header className="animate-fade-up min-w-0 shrink-0" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-2">
          <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-tight tracking-tight text-white">
            Analytics
          </h1>
          <BarChart3
            className="h-5 w-5 text-[#25C8FF] drop-shadow-[0_0_8px_rgba(37,200,255,0.45)]"
            strokeWidth={2}
            aria-hidden
          />
        </div>
        <p className="mt-2 max-w-xl text-[15px] text-text-secondary">
          Understand your productivity, spot patterns, and keep improving.
        </p>
      </header>
      <div className="flex lg:justify-end">
        <DateRangeFilter
          filter={filter}
          onPreset={onPreset}
          onCustomDates={onCustomDates}
          invalidCustom={invalidCustom}
        />
      </div>
    </div>
  )
}
