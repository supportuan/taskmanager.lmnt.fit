import { Link } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import { GlassCard } from '../layout/GlassCard'
import { Button } from '../common/Button'

export function AnalyticsEmptyState() {
  return (
    <GlassCard
      tier="accent"
      glow="blue"
      className="flex flex-col items-center px-6 py-14 text-center sm:py-16"
      style={{ animationDelay: '0.12s' }}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: 'rgba(37, 200, 255, 0.12)',
          border: '1px solid rgba(37, 200, 255, 0.25)',
          boxShadow: '0 0 24px rgba(37, 200, 255, 0.12)',
        }}
      >
        <BarChart3 className="h-7 w-7 text-[#25C8FF]" strokeWidth={1.75} />
      </div>
      <h2 className="text-lg font-semibold text-text-main">Not enough data yet</h2>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        Complete a few tasks to unlock your productivity insights. Analytics uses the same task
        history as Task Tracker and Completed.
      </p>
      <Link to="/tracker" className="mt-6">
        <Button type="button">Go to Task Tracker</Button>
      </Link>
    </GlassCard>
  )
}
