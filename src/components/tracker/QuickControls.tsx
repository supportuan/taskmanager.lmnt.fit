import { Check, Pause, Play, SkipForward } from 'lucide-react'
import type { TrackerTask } from '../../types/tracker'
import { Button } from '../common/Button'
import { GlassCard } from '../layout/GlassCard'

interface QuickControlsProps {
  task: TrackerTask | undefined
  embedded?: boolean
  disabled?: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onComplete: () => void
  onSkip?: () => void
  showSkip?: boolean
}

export function QuickControls({
  task,
  embedded = false,
  disabled = false,
  onStart,
  onPause,
  onResume,
  onComplete,
  onSkip,
  showSkip = true,
}: QuickControlsProps) {
  if (!task) return null

  const ws = task.workflowStatus
  const completed = ws === 'completed'

  const body = completed ? (
    <p className="flex items-center gap-2 text-sm font-medium text-success">
      <Check className="h-4 w-4" strokeWidth={2.5} />
      Completed
    </p>
  ) : (
    <div className="flex flex-wrap items-center gap-3">
      {ws === 'not_started' && (
        <Button type="button" onClick={onStart} disabled={disabled}>
          <Play className="h-4 w-4 fill-current" strokeWidth={0} />
          {showSkip ? 'Start Task' : 'Start'}
        </Button>
      )}

      {ws === 'in_progress' && (
        <>
          <Button type="button" variant="secondary" onClick={onPause} disabled={disabled}>
            <Pause className="h-4 w-4" strokeWidth={2} />
            Pause
          </Button>
          <Button type="button" onClick={onComplete} disabled={disabled}>
            <Check className="h-4 w-4" strokeWidth={2.5} />
            Complete
          </Button>
        </>
      )}

      {ws === 'paused' && (
        <>
          <Button type="button" onClick={onResume} disabled={disabled}>
            <Play className="h-4 w-4 fill-current" strokeWidth={0} />
            Resume
          </Button>
          <Button type="button" onClick={onComplete} disabled={disabled}>
            <Check className="h-4 w-4" strokeWidth={2.5} />
            Complete
          </Button>
        </>
      )}

      {showSkip && onSkip ? (
        <Button type="button" variant="secondary" onClick={onSkip} disabled={disabled}>
          <SkipForward className="h-4 w-4" strokeWidth={2} />
          Skip
        </Button>
      ) : null}
    </div>
  )

  const heading = (
    <h2 className="text-sm font-semibold tracking-tight text-text-main">Quick Controls</h2>
  )

  if (embedded) {
    return (
      <div className="tracker-quick-controls-embedded relative mt-5 border-t border-white/10 pt-5 lg:mt-6 lg:pt-6">
        <div className="mb-3 flex items-center justify-between gap-3">{heading}</div>
        {body}
      </div>
    )
  }

  return (
    <GlassCard tier="secondary" className="p-4 lg:p-5" style={{ animationDelay: '0.2s' }}>
      <div className="mb-3">{heading}</div>
      {body}
    </GlassCard>
  )
}
