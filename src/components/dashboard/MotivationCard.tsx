import { Lightbulb } from 'lucide-react'
import { GlassCard } from '../layout/GlassCard'

export function MotivationCard() {
  return (
    <GlassCard
      tier="secondary"
      className="flex max-w-sm items-center gap-3 px-4 py-3 lg:shrink-0"
      style={{ animationDelay: '0.1s' }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: 'rgba(245, 181, 68, 0.12)',
          boxShadow: '0 0 16px rgba(245, 181, 68, 0.15)',
        }}
      >
        <Lightbulb className="h-[18px] w-[18px] text-warning" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-medium leading-snug text-text-secondary">
        <span className="text-text-main">Progress, not perfection.</span>
        <br />
        One task at a time—you&apos;ve got this.
      </p>
    </GlassCard>
  )
}
