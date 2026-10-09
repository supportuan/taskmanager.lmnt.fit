import type { AnalyticsCompletionSummary } from '../../types/analytics'
import { chartCompletionSeries } from '../../utils/analytics/chartSeries'
import { formatPercent } from '../../utils/analytics/formatting'
import { GlassCard } from '../layout/GlassCard'
import { CompletionTrendChart } from './charts/CompletionTrendChart'
import { PlannedVsCompletedChart } from './charts/PlannedVsCompletedChart'

interface CompletionAnalyticsProps {
  completion: AnalyticsCompletionSummary
}

export function CompletionAnalytics({ completion }: CompletionAnalyticsProps) {
  const chartDaily = chartCompletionSeries(completion.daily)

  return (
    <section aria-labelledby="completion-analytics-heading" className="flex min-w-0 flex-col gap-4">
      <GlassCard tier="main" className="p-6" style={{ animationDelay: '0.1s' }}>
        <div className="mb-4">
          <h2
            id="completion-analytics-heading"
            className="text-lg font-semibold tracking-tight text-text-main"
          >
            Completion Analytics
          </h2>
          <p className="text-xs text-text-muted">
            How consistently are you finishing your planned work?
          </p>
        </div>
        <CompletionTrendChart data={chartDaily} />
        {completion.insightLine ? (
          <p className="mt-4 text-sm text-text-secondary">{completion.insightLine}</p>
        ) : null}
        {completion.averageDailyCompletionRate != null ? (
          <p className="mt-1 text-xs text-text-muted">
            Average daily completion rate:{' '}
            {formatPercent(completion.averageDailyCompletionRate)}
          </p>
        ) : null}
      </GlassCard>

      <GlassCard tier="main" className="p-6" style={{ animationDelay: '0.14s' }}>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-text-main">Planned vs completed</h3>
          <p className="text-xs text-text-muted">Daily scheduled work compared to finished tasks</p>
        </div>
        <PlannedVsCompletedChart data={chartDaily} />
      </GlassCard>
    </section>
  )
}
