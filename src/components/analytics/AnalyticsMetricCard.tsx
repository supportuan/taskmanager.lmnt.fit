import type { LucideIcon } from 'lucide-react'
import type { MetricTrend } from '../../types/analytics'
import { GlassCard } from '../layout/GlassCard'

interface AnalyticsMetricCardProps {
  icon: LucideIcon
  value: string
  label: string
  accent?: string
  trend?: MetricTrend
  delay?: string
}

export function AnalyticsMetricCard({
  icon: Icon,
  value,
  label,
  accent = '#208CFF',
  trend,
  delay = '0s',
}: AnalyticsMetricCardProps) {
  const trendClass =
    trend?.tone === 'positive'
      ? 'text-success'
      : trend?.tone === 'negative'
        ? 'text-warning'
        : 'text-text-muted'

  return (
    <GlassCard
      tier="secondary"
      className="flex min-w-0 flex-col gap-2.5 p-4 sm:p-5"
      animate
      style={{ animationDelay: delay }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{
          background: `${accent}1a`,
          border: `1px solid ${accent}40`,
          boxShadow: `0 0 12px ${accent}18`,
        }}
      >
        <Icon
          className="h-[18px] w-[18px]"
          style={{ color: accent, filter: `drop-shadow(0 0 4px ${accent}44)` }}
          strokeWidth={1.75}
        />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tracking-tight text-text-main">{value}</p>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-text-muted">
          {label}
        </p>
        {trend ? (
          <p className={`mt-1.5 text-[11px] font-medium ${trendClass}`}>{trend.label}</p>
        ) : null}
      </div>
    </GlassCard>
  )
}
