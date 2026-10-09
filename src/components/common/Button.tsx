import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-[220ms] ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary: 'btn-primary text-white',
    secondary: 'btn-glass text-text-main',
    ghost:
      'bg-transparent text-text-secondary hover:bg-white/[0.06] hover:text-text-main hover:shadow-[0_0_10px_rgba(32,140,255,0.1)]',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
