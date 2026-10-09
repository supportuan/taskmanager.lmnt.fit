import { TaskFlowLogo } from '../layout/TaskFlowLogo'

export function AuthBranding() {
  return (
    <div className="auth-page-branding animate-fade-up min-w-0 shrink-0" style={{ animationDelay: '0.04s' }}>
      <TaskFlowLogo />
      <p className="mt-2 max-w-xs text-sm font-medium tracking-wide text-text-secondary/90">
        Plan. Focus. Accomplish.
      </p>
    </div>
  )
}
