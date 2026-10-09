import type { HTMLAttributes, ReactNode } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  /** @deprecated use `tier` — kept for compatibility */
  glow?: 'none' | 'blue' | 'purple'
  tier?: 'main' | 'secondary' | 'accent'
  animate?: boolean
}

const tierStyles = {
  main: 'glass-panel',
  secondary: 'glass-panel-secondary',
  accent: 'glass-panel-accent',
}

const glowStyles = {
  none: '',
  blue: 'shadow-glowBlue',
  purple: 'shadow-[0_0_24px_rgba(123,77,255,0.18)]',
}

export function GlassCard({
  children,
  className = '',
  glow = 'none',
  tier = 'main',
  animate = true,
  ...props
}: GlassCardProps) {
  const panelClass = tierStyles[tier]

  return (
    <div
      className={[
        panelClass,
        'rounded-glass',
        glowStyles[glow],
        animate ? 'animate-fade-up' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
