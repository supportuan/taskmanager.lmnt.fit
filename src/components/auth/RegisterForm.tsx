import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthErrorMessage, getAuthFieldErrors, useAuth } from '../../context/AuthContext'
import {
  validateRegisterForm,
  type RegisterFieldErrors,
  type RegisterFormValues,
} from '../../utils/authValidation'
import { Button } from '../common/Button'
import { FormField } from '../forms/FormField'
import { AuthInput } from './AuthInput'
import { PasswordInput } from './PasswordInput'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState<RegisterFormValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<RegisterFieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const nextErrors = validateRegisterForm(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const fieldErrors = getAuthFieldErrors(error)
      if (fieldErrors) {
        setErrors({
          form: getAuthErrorMessage(error),
          name: fieldErrors.name,
          email: fieldErrors.email,
          password: fieldErrors.password,
          confirmPassword: fieldErrors.confirmPassword,
        })
      } else {
        setErrors({ form: getAuthErrorMessage(error) })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      id="auth-panel-register"
      role="tabpanel"
      aria-labelledby="auth-tab-register"
      className="flex flex-col gap-5"
      onSubmit={onSubmit}
      noValidate
    >
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight text-text-main">
          Create your TaskFlow account
        </h2>
        <p className="text-sm text-text-muted">
          Start planning, focusing, and accomplishing more.
        </p>
      </div>

      {errors.form && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger" role="alert">
          {errors.form}
        </p>
      )}

      <FormField label="First Name" htmlFor="register-name" required error={errors.name}>
        <AuthInput
          id="register-name"
          name="name"
          autoComplete="given-name"
          placeholder="Enter your first name"
          value={values.name}
          hasError={Boolean(errors.name)}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
      </FormField>

      <FormField label="Email" htmlFor="register-email" required error={errors.email}>
        <AuthInput
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          hasError={Boolean(errors.email)}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
      </FormField>

      <FormField label="Password" htmlFor="register-password" required error={errors.password}>
        <PasswordInput
          id="register-password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={values.password}
          hasError={Boolean(errors.password)}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
        />
      </FormField>

      <FormField
        label="Confirm Password"
        htmlFor="register-confirm-password"
        required
        error={errors.confirmPassword}
      >
        <PasswordInput
          id="register-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat password"
          value={values.confirmPassword}
          hasError={Boolean(errors.confirmPassword)}
          onChange={(e) => setValues((v) => ({ ...v, confirmPassword: e.target.value }))}
        />
      </FormField>

      <Button type="submit" className="auth-primary-btn w-full" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-text-muted">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-primary-cyan transition hover:text-text-main focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
        >
          Sign In
        </button>
      </p>
    </form>
  )
}
