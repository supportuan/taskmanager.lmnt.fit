const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface LoginFormValues {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export type LoginFieldErrors = Partial<Record<'email' | 'password' | 'form', string>>
export type RegisterFieldErrors = Partial<
  Record<'name' | 'email' | 'password' | 'confirmPassword' | 'form', string>
>

export function validateLoginForm(values: LoginFormValues): LoginFieldErrors {
  const errors: LoginFieldErrors = {}
  const email = values.email.trim()
  if (!email) errors.email = 'Email is required.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.'
  if (!values.password) errors.password = 'Password is required.'
  return errors
}

export function validateRegisterForm(values: RegisterFormValues): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  if (!name) errors.name = 'First name is required.'
  if (!email) errors.email = 'Email is required.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.'
  if (!values.password) errors.password = 'Password is required.'
  else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}
