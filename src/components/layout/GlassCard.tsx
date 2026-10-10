import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

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

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  {
    children,
    className = '',
    glow = 'none',
    tier = 'main',
    animate = true,
    ...props
  },
  ref,
) {
  const panelClass = tierStyles[tier]

  return (
    <div
      ref={ref}
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
})
