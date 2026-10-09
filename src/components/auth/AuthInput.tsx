import type { InputHTMLAttributes } from 'react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export function AuthInput({ className = '', hasError = false, ...props }: AuthInputProps) {
  return (
    <input
      className={[
        'glass-input w-full min-w-0 rounded-xl px-3.5 py-2.5 text-sm',
        hasError ? 'border-danger/50 focus:border-danger/70' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
