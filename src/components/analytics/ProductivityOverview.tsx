import { Activity, CheckCircle2, Flame, ListChecks, Sparkles, Timer } from 'lucide-react'
import type { AnalyticsOverview } from '../../types/analytics'
import { formatAverageMinutes, formatPercent, formatStreakDays } from '../../utils/analytics/formatting'
import { formatTimeWorked } from '../../utils/dateUtils'
import { AnalyticsMetricCard } from './AnalyticsMetricCard'

interface ProductivityOverviewProps {
  overview: AnalyticsOverview
  productivityScore: number | null
}

export function ProductivityOverview({ overview, productivityScore }: ProductivityOverviewProps) {
  const completionValue =
    overview.tasksPlanned === 0
      ? overview.tasksCompleted === 0
        ? '—'
        : '0%'
      : formatPercent(overview.completionRate, '0%')

  return (
    <section aria-labelledby="analytics-overview-heading" className="min-w-0">
      <h2
        id="analytics-overview-heading"
        className="mb-3 text-lg font-semibold text-text-main"
      >
        Productivity Overview
      </h2>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6 xl:gap-4">
        <AnalyticsMetricCard
          icon={Sparkles}
          value={productivityScore != null ? `${productivityScore}/100` : '—'}
          label="Productivity score"
          accent="#7B4DFF"
          delay="0.1s"
        />
        <AnalyticsMetricCard
          icon={Activity}
          value={completionValue}
          label="Completion rate"
          accent="#25C8FF"
          trend={overview.trends.completionRate}
          delay="0.12s"
        />
        <AnalyticsMetricCard
          icon={ListChecks}
          value={String(overview.tasksCompleted)}
          label="Tasks completed"
          accent="#7B4DFF"
          trend={overview.trends.tasksCompleted}
          delay="0.16s"
        />
        <AnalyticsMetricCard
          icon={Timer}
          value={formatTimeWorked(overview.timeWorkedMinutes)}
          label="Time worked"
          accent="#208CFF"
          trend={overview.trends.timeWorked}
          delay="0.2s"
        />
        <AnalyticsMetricCard
          icon={CheckCircle2}
          value={formatAverageMinutes(overview.averageTaskMinutes)}
          label="Avg task time"
          accent="#5B8DFF"
          trend={overview.trends.averageTask}
          delay="0.24s"
        />
        <AnalyticsMetricCard
          icon={Flame}
          value={formatStreakDays(overview.currentStreakDays)}
          label="Current streak"
          accent="#2DD4A3"
          delay="0.28s"
        />
      </div>
    </section>
  )
}
