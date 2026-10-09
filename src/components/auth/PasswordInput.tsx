import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'
import { AuthInput } from './AuthInput'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  hasError?: boolean
}

export function PasswordInput({ hasError, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative flex min-w-0 items-stretch">
      <AuthInput
        {...props}
        type={visible ? 'text' : 'password'}
        hasError={hasError}
        className={`pr-11 ${className ?? ''}`.trim()}
        autoComplete={props.autoComplete ?? 'current-password'}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-xl text-text-muted transition hover:text-primary-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-blue"
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        ) : (
          <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        )}
      </button>
    </div>
  )
}
