export type UserRole = 'USER' | 'SUPER_ADMIN'
export type UserAccountStatus = 'ACTIVE' | 'BLOCKED'

export interface AuthUser {
  id: string
  email: string
  name: string
  role?: UserRole
  status?: UserAccountStatus
}

export interface AuthSession {
  token: string
  user: AuthUser
  expiresAt: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export type AuthMode = 'login' | 'register'
