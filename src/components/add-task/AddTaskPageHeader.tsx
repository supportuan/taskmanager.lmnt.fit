import { Sparkles } from 'lucide-react'

export function AddTaskPageHeader() {
  return (
    <header
      className="add-task-page-header animate-fade-up w-full max-w-[675px] shrink-0"
      style={{ animationDelay: '0.04s' }}
    >
      <div className="flex items-center gap-1.5">
        <h1 className="text-base font-semibold leading-none tracking-tight text-white sm:text-[30px]">
          Create a New Task
        </h1>
        <Sparkles
          className="h-3.5 w-3.5 text-primary-cyan drop-shadow-[0_0_6px_rgba(37,200,255,0.5)]"
          strokeWidth={1.75}
          aria-hidden
        />
      </div>
      <p className="mt-1 text-xs leading-snug text-text-secondary">
        Plan smart, stay organized, achieve more.
      </p>
    </header>
  )
}
