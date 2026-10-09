import { Forward } from 'lucide-react'
import { GlassCard } from '../layout/GlassCard'

interface ForwardedTasksEmptyStateProps {
  variant: 'none' | 'search'
}

export function ForwardedTasksEmptyState({ variant }: ForwardedTasksEmptyStateProps) {
  const isSearch = variant === 'search'

  return (
    <GlassCard tier="secondary" className="mx-auto max-w-lg p-10 text-center">
      <Forward
        className="mx-auto mb-4 h-8 w-8 text-primary-cyan drop-shadow-[0_0_10px_rgba(37,200,255,0.35)]"
        strokeWidth={1.75}
        aria-hidden
      />
      <p className="text-lg font-semibold text-text-main">
        {isSearch ? 'No forwarded tasks match your search.' : 'No forwarded tasks.'}
      </p>
      {!isSearch ? (
        <p className="mt-2 text-sm text-text-secondary">You&apos;re all caught up.</p>
      ) : null}
    </GlassCard>
  )
}
