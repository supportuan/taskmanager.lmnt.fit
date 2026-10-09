interface AuthTabsProps {
  mode: 'login' | 'register'
  onChange: (mode: 'login' | 'register') => void
}

export function AuthTabs({ mode, onChange }: AuthTabsProps) {
  return (
    <div
      className="auth-tabs flex gap-6 border-b border-white/10"
      role="tablist"
      aria-label="Authentication mode"
    >
      {(
        [
          { id: 'login' as const, label: 'Login' },
          { id: 'register' as const, label: 'Register' },
        ] as const
      ).map(({ id, label }) => {
        const selected = mode === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            id={`auth-tab-${id}`}
            aria-selected={selected}
            aria-controls={`auth-panel-${id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(id)}
            className={[
              'auth-tab pb-3 text-sm font-semibold transition-all duration-[220ms] ease-out',
              selected ? 'auth-tab-active text-text-main' : 'text-text-muted hover:text-text-secondary',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
