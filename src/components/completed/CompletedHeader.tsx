import { CheckCircle2 } from 'lucide-react'
import { GlassCard } from '../layout/GlassCard'

export function CompletedHeader() {
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[1fr_minmax(260px,340px)] lg:items-start">
      <header className="animate-fade-up min-w-0 shrink-0" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-2">
          <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-tight tracking-tight text-white">
            Completed Tasks
          </h1>
          <CheckCircle2
            className="h-5 w-5 text-success drop-shadow-[0_0_8px_rgba(45,212,163,0.45)]"
            strokeWidth={2}
            aria-hidden
          />
        </div>
        <p className="mt-2 max-w-xl text-[15px] text-text-secondary">
          Look back at what you&apos;ve accomplished and celebrate your progress.
        </p>
      </header>

      <div className="flex lg:justify-end">
      <GlassCard
        tier="secondary"
        className="flex w-full max-w-md items-center gap-3 px-4 py-3 lg:shrink-0"
        style={{ animationDelay: '0.1s' }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: 'rgba(45, 212, 163, 0.12)',
            boxShadow: '0 0 16px rgba(45, 212, 163, 0.12)',
          }}
        >
          <CheckCircle2 className="h-[18px] w-[18px] text-success" strokeWidth={2} />
        </div>
        <p className="text-sm font-medium leading-snug text-text-secondary">
          Every completed task is proof that you&apos;re moving forward.
        </p>
      </GlassCard>
      </div>
    </div>
  )
}
