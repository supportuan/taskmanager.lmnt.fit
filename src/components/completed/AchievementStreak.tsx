import { Flame, Medal, Target } from 'lucide-react'
import type { StreakMetrics } from '../../utils/completedMetrics'
import type { TimePerformanceMetrics } from '../../utils/completedMetrics'
import { GlassCard } from '../layout/GlassCard'

interface AchievementStreakProps {
  streaks: StreakMetrics
  performance: TimePerformanceMetrics
}

export function AchievementStreak({ streaks, performance }: AchievementStreakProps) {
  return (
    <GlassCard tier="main" className="p-5 lg:p-6" style={{ animationDelay: '0.16s' }}>
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-text-main">
        Achievements / Streak
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
        <Stat
          icon={Flame}
          label="Current Streak"
          value={String(streaks.currentStreakDays)}
          suffix="days"
          accent="warning"
          highlight
        />
        <Stat
          icon={Medal}
          label="Longest Streak"
          value={String(streaks.longestStreakDays)}
          suffix="days"
          accent="cyan"
        />
        <Stat
          icon={Target}
          label="Early Finishes"
          value={String(performance.earlyCompletionCount)}
          accent="success"
        />
      </div>
    </GlassCard>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  suffix,
  accent,
  highlight,
}: {
  icon: typeof Flame
  label: string
  value: string
  suffix?: string
  accent: 'warning' | 'cyan' | 'success'
  highlight?: boolean
}) {
  const iconColor =
    accent === 'warning' ? '#F5B544' : accent === 'success' ? '#2DD4A3' : '#25C8FF'

  return (
    <div
      className={[
        'min-w-0 flex-1 rounded-xl border px-4 py-3.5',
        highlight
          ? 'border-[rgba(245,181,68,0.22)] bg-white/[0.04]'
          : 'border-white/10 bg-white/[0.03]',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" style={{ color: iconColor }} strokeWidth={1.75} />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-text-main">
        {value}
        {suffix && (
          <span className="ml-1 text-sm font-medium text-text-muted">{suffix}</span>
        )}
      </p>
    </div>
  )
}
