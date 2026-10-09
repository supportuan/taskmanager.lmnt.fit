import { CheckCircle2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../common/Button'
import { GlassCard } from '../layout/GlassCard'

export function CompletedEmptyState() {
  return (
    <GlassCard
      tier="accent"
      glow="blue"
      className="flex flex-col items-center px-6 py-14 text-center sm:py-16"
      style={{ animationDelay: '0.12s' }}
    >
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: 'rgba(32, 140, 255, 0.12)',
          boxShadow: '0 0 28px rgba(37, 200, 255, 0.2)',
        }}
      >
        <Sparkles className="h-8 w-8 text-primary-cyan" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-semibold text-white">Your first win is waiting.</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
        Nothing completed yet. Finish your first task in Task Tracker and your progress, reflections,
        and streak will appear here.
      </p>
      <Link to="/tracker" className="mt-6">
        <Button type="button">
          <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
          Go to Task Tracker
        </Button>
      </Link>
    </GlassCard>
  )
}
