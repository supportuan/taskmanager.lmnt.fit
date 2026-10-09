import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAuthErrorMessage, useAuth } from '../../context/AuthContext'
import {
  validateLoginForm,
  type LoginFieldErrors,
  type LoginFormValues,
} from '../../utils/authValidation'
import { Button } from '../common/Button'
import { FormField } from '../forms/FormField'
import { AuthInput } from './AuthInput'
import { PasswordInput } from './PasswordInput'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<LoginFieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const nextErrors = validateLoginForm(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await login({
        email: values.email.trim(),
        password: values.password,
        rememberMe: values.rememberMe,
      })
      navigate(from, { replace: true })
    } catch (error) {
      setErrors({ form: getAuthErrorMessage(error) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      id="auth-panel-login"
      role="tabpanel"
      aria-labelledby="auth-tab-login"
      className="flex flex-col gap-5"
      onSubmit={onSubmit}
      noValidate
    >
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight text-text-main">Welcome back</h2>
        <p className="text-sm text-text-muted">Sign in to continue to TaskFlow.</p>
      </div>

      {errors.form && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger" role="alert">
          {errors.form}
        </p>
      )}

      <FormField label="Email" htmlFor="login-email" required error={errors.email}>
        <AuthInput
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          hasError={Boolean(errors.email)}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
      </FormField>

      <FormField label="Password" htmlFor="login-password" required error={errors.password}>
        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={values.password}
          hasError={Boolean(errors.password)}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
        />
      </FormField>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-text-secondary">
          <input
            type="checkbox"
            checked={values.rememberMe}
            onChange={(e) => setValues((v) => ({ ...v, rememberMe: e.target.checked }))}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary-blue focus:ring-primary-blue/40"
          />
          Remember me
        </label>
        <button
          type="button"
          className="text-text-muted transition hover:text-primary-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
          onClick={() =>
            setErrors((prev) => ({
              ...prev,
              form: 'Password reset will be available once your TaskFlow account is connected to the server.',
            }))
          }
        >
          Forgot password?
        </button>
      </div>

      <Button type="submit" className="auth-primary-btn w-full" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign In'}
      </Button>

      <p className="text-center text-sm text-text-muted">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-primary-cyan transition hover:text-text-main focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
        >
          Create account
        </button>
      </p>
    </form>
  )
}
