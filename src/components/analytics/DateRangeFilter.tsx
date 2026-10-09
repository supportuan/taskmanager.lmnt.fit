import type { AnalyticsFilterState, AnalyticsRangePreset } from '../../types/analytics'

const PRESETS: { id: AnalyticsRangePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
]

interface DateRangeFilterProps {
  filter: AnalyticsFilterState
  onPreset: (preset: AnalyticsRangePreset) => void
  onCustomDates: (start: string, end: string) => void
  invalidCustom?: boolean
}

export function DateRangeFilter({
  filter,
  onPreset,
  onCustomDates,
  invalidCustom,
}: DateRangeFilterProps) {
  return (
    <div
      className="animate-fade-up w-full max-w-xl min-w-0"
      style={{ animationDelay: '0.08s' }}
    >
      <div
        className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md"
        role="tablist"
        aria-label="Analytics date range"
      >
        {PRESETS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter.range === id}
            onClick={() => onPreset(id)}
            className={[
              'rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-[220ms] sm:px-3 sm:text-xs',
              filter.range === id
                ? 'segment-tab-active'
                : 'text-text-muted hover:text-text-secondary',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>
      {filter.range === 'custom' ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs text-text-muted">
            Start date
            <input
              type="date"
              value={filter.startDate}
              max={filter.endDate || undefined}
              onChange={(e) => onCustomDates(e.target.value, filter.endDate)}
              className="glass-input glass-input-field h-10 w-full rounded-xl px-3 text-[13px] text-text-main"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-text-muted">
            End date
            <input
              type="date"
              value={filter.endDate}
              min={filter.startDate || undefined}
              onChange={(e) => onCustomDates(filter.startDate, e.target.value)}
              className="glass-input glass-input-field h-10 w-full rounded-xl px-3 text-[13px] text-text-main"
            />
          </label>
          {invalidCustom ? (
            <p className="sm:col-span-2 text-xs text-warning">Start date must be on or before end date.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
