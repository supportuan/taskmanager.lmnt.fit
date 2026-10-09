import type { AnalyticsTimeSummary } from '../../types/analytics'
import { chartTimeSeries } from '../../utils/analytics/chartSeries'
import { formatMinutesCompact } from '../../utils/analytics/formatting'
import { GlassCard } from '../layout/GlassCard'
import { CategoryTimeChart } from './charts/CategoryTimeChart'
import { TimeWorkedChart } from './charts/TimeWorkedChart'

interface TimeAnalyticsSectionProps {
  time: AnalyticsTimeSummary
}

export function TimeAnalyticsSection({ time }: TimeAnalyticsSectionProps) {
  const chartDaily = chartTimeSeries(time.daily)
  const delta = time.timeDeltaMinutes
  const deltaLabel =
    delta > 0
      ? `${formatMinutesCompact(delta)} saved vs plan`
      : delta < 0
        ? `${formatMinutesCompact(-delta)} over plan`
        : 'On plan'

  return (
    <section aria-labelledby="time-analytics-heading" className="analytics-time-grid min-w-0 gap-4">
      <GlassCard tier="main" className="p-6 analytics-time-trend" style={{ animationDelay: '0.12s' }}>
        <div className="mb-4">
          <h2
            id="time-analytics-heading"
            className="text-lg font-semibold tracking-tight text-text-main"
          >
            Time Analytics
          </h2>
          <p className="text-xs text-text-muted">See where your working time is going.</p>
        </div>
        <TimeWorkedChart data={chartDaily} />
      </GlassCard>

      <GlassCard tier="main" className="p-6 analytics-time-plan" style={{ animationDelay: '0.16s' }}>
        <h3 className="text-base font-semibold text-text-main">Planned vs actual</h3>
        <p className="mb-4 text-xs text-text-muted">Aggregate time for completed work in range</p>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-text-muted">Planned</dt>
            <dd className="mt-1 text-lg font-semibold text-text-main">
              {formatMinutesCompact(time.totalPlannedMinutes)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-text-muted">Actual</dt>
            <dd className="mt-1 text-lg font-semibold text-text-main">
              {formatMinutesCompact(time.totalActualMinutes)}
            </dd>
          </div>
          <div className="col-span-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <dt className="text-xs text-text-muted">Difference</dt>
            <dd
              className={`mt-0.5 font-medium ${delta >= 0 ? 'text-success' : 'text-warning'}`}
            >
              {deltaLabel}
            </dd>
            {time.efficiencyLabel ? (
              <p className="mt-1 text-xs text-text-secondary">{time.efficiencyLabel}</p>
            ) : null}
          </div>
        </dl>
        {time.priorityBreakdown.length > 0 ? (
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
              Time by priority
            </p>
            <ul className="flex flex-wrap gap-2">
              {time.priorityBreakdown.map((p) => (
                <li
                  key={p.priority}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-text-secondary"
                >
                  {p.priority}: {formatMinutesCompact(p.actualMinutes)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </GlassCard>

      <GlassCard tier="main" className="p-6 analytics-time-category" style={{ animationDelay: '0.2s' }}>
        <h3 className="mb-1 text-base font-semibold text-text-main">Category time</h3>
        <p className="mb-4 text-xs text-text-muted">Actual minutes by category</p>
        <CategoryTimeChart data={time.categoryBreakdown} />
      </GlassCard>
    </section>
  )
}
