import { Forward } from 'lucide-react'

export function ForwardedTasksHeader() {
  return (
    <header className="animate-fade-up min-w-0 shrink-0" style={{ animationDelay: '0.05s' }}>
      <div className="flex items-center gap-2">
        <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-tight tracking-tight text-white">
          Forwarded Tasks
        </h1>
        <Forward
          className="h-5 w-5 text-primary-cyan drop-shadow-[0_0_8px_rgba(37,200,255,0.6)]"
          strokeWidth={1.75}
          aria-hidden
        />
      </div>
      <p className="mt-2 max-w-xl text-[15px] text-text-secondary">
        Past-due tasks that still need your attention. Complete them to clear your backlog.
      </p>
    </header>
  )
}
