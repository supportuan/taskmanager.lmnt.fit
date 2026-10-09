import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'

interface GlassSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string
}

export function GlassSelect({ id, className = '', children, ...props }: GlassSelectProps) {
  return (
    <div className="glass-select-wrap relative">
      <select id={id} className={`glass-select ${className}`} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  )
}
