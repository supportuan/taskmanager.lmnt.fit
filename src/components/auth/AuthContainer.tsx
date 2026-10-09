import { useState } from 'react'
import type { AuthMode } from '../../types/auth'
import { GlassCard } from '../layout/GlassCard'
import { AuthTabs } from './AuthTabs'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export function AuthContainer() {
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <GlassCard
      tier="accent"
      glow="blue"
      className="auth-page-card w-full animate-fade-up"
      style={{ animationDelay: '0.1s' }}
    >
      <div className="flex min-w-0 flex-col gap-8">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            Authentication
          </p>
          <AuthTabs mode={mode} onChange={setMode} />
        </div>

        <div key={mode} className="auth-panel-transition">
          {mode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setMode('login')} />
          )}
        </div>
      </div>
    </GlassCard>
  )
}
