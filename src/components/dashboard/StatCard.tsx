import type { LucideIcon } from 'lucide-react'
import { ProgressBar } from '../common/ProgressBar'
import { GlassCard } from '../layout/GlassCard'

interface StatCardProps {
  icon: LucideIcon
  value: string
  label: string
  accent?: string
  showProgress?: boolean
  progressValue?: number
  delay?: string
}

export function StatCard({
  icon: Icon,
  value,
  label,
  accent = '#208CFF',
  showProgress,
  progressValue,
  delay = '0s',
}: StatCardProps) {
  return (
    <GlassCard
      tier="secondary"
      className="flex flex-col gap-2.5 p-4 sm:p-5"
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
      <div>
        <p className="text-2xl font-semibold tracking-tight text-text-main">{value}</p>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-text-muted">
          {label}
        </p>
      </div>
      {showProgress && progressValue !== undefined && (
        <ProgressBar value={progressValue} className="mt-auto" />
      )}
    </GlassCard>
  )
}
