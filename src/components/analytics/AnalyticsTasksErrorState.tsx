import { AlertCircle } from 'lucide-react'
import { Button } from '../common/Button'
import { GlassCard } from '../layout/GlassCard'

interface AnalyticsTasksErrorStateProps {
  message: string
  onRetry: () => void
  retrying?: boolean
  title?: string
}

export function AnalyticsTasksErrorState({
  message,
  onRetry,
  retrying = false,
  title = "Couldn't load analytics",
}: AnalyticsTasksErrorStateProps) {
  return (
    <GlassCard
      tier="accent"
      className="flex flex-col items-center px-6 py-14 text-center sm:py-16"
      style={{ animationDelay: '0.12s' }}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: 'rgba(255, 92, 112, 0.1)',
          border: '1px solid rgba(255, 92, 112, 0.25)',
        }}
      >
        <AlertCircle className="h-7 w-7 text-danger" strokeWidth={1.75} />
      </div>
      <h2 className="text-lg font-semibold text-text-main">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-text-secondary">{message}</p>
      <Button type="button" className="mt-6" disabled={retrying} onClick={() => void onRetry()}>
        {retrying ? 'Retrying…' : 'Try again'}
      </Button>
    </GlassCard>
  )
}
