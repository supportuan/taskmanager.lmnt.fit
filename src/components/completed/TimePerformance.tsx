import { Clock, Gauge, Timer, TrendingDown, TrendingUp, Trophy } from 'lucide-react'
import type { TimePerformanceMetrics } from '../../utils/completedMetrics'
import { formatDuration, formatMinutesSummary, formatTimeWorked } from '../../utils/dateUtils'
import { ProgressBar } from '../common/ProgressBar'
import { GlassCard } from '../layout/GlassCard'

interface TimePerformanceProps {
  metrics: TimePerformanceMetrics
}

export function TimePerformance({ metrics }: TimePerformanceProps) {
  const planned = metrics.totalPlannedMinutes
  const actual = metrics.totalActualMinutes
  const compareMax = Math.max(planned, actual, 1)
  const plannedPct = Math.round((planned / compareMax) * 100)
  const actualPct = Math.round((actual / compareMax) * 100)

  return (
    <GlassCard tier="main" className="p-6" style={{ animationDelay: '0.12s' }}>
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-text-main">Time Performance</h2>
        <p className="text-xs text-text-muted">How you spent time on finished tasks</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric icon={Trophy} label="Total Completed" value={String(metrics.totalCompleted)} />
        <Metric
          icon={Clock}
          label="Planned Time"
          value={formatTimeWorked(metrics.totalPlannedMinutes)}
        />
        <Metric
          icon={Timer}
          label="Time Worked"
          value={formatTimeWorked(metrics.totalActualMinutes)}
        />
        <Metric
          icon={Gauge}
          label="Average Task"
          value={formatDuration(metrics.averageActualMinutes)}
        />
        <Metric
          icon={TrendingDown}
          label="Time Saved"
          value={formatMinutesSummary(metrics.timeSavedMinutes)}
          accent="#2DD4A3"
        />
        <Metric
          icon={TrendingUp}
          label="Over Plan"
          value={formatMinutesSummary(metrics.overPlannedMinutes)}
          accent={metrics.overPlannedMinutes > 0 ? '#F5B544' : '#208CFF'}
        />
      </div>

      {metrics.totalCompleted > 0 && (
        <div className="mt-5 space-y-3 rounded-xl border border-white/8 bg-white/[0.03] p-4">
          <div>
            <div className="mb-1.5 flex justify-between text-[11px] font-medium text-text-muted">
              <span>Planned</span>
              <span>{formatTimeWorked(planned)}</span>
            </div>
            <ProgressBar value={plannedPct} className="h-2 opacity-90" />
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-[11px] font-medium text-text-muted">
              <span>Actual</span>
              <span>{formatTimeWorked(actual)}</span>
            </div>
            <ProgressBar value={actualPct} className="h-2" />
          </div>
          <p className="text-xs text-text-secondary">
            {metrics.earlyCompletionCount} finished early
            {metrics.overPlannedCount > 0
              ? ` · ${metrics.overPlannedCount} over planned`
              : ''}
            {metrics.timeSavedMinutes > 0 && metrics.overPlannedMinutes > 0
              ? ` · ${formatMinutesSummary(metrics.timeSavedMinutes)} saved vs ${formatMinutesSummary(metrics.overPlannedMinutes)} over`
              : ''}
          </p>
        </div>
      )}
    </GlassCard>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  accent = '#208CFF',
  className = '',
}: {
  icon: typeof Clock
  label: string
  value: string
  accent?: string
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-white/8 bg-white/[0.03] p-3 ${className}`.trim()}
    >
      <Icon className="mb-2 h-4 w-4" style={{ color: accent }} strokeWidth={1.75} />
      <p className="text-lg font-semibold tabular-nums text-text-main">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
    </div>
  )
}
