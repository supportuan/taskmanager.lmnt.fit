import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  icon: Icon,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`.trim()}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-text-secondary"
      >
        {Icon && (
          <Icon className="h-3.5 w-3.5 shrink-0 text-primary-cyan/90" strokeWidth={1.75} />
        )}
        <span>
          {label}
          {required && <span className="text-primary-cyan"> *</span>}
        </span>
      </label>
      {children}
      {error && (
        <p className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
