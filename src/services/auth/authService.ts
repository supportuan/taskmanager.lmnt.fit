import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from '../../types/auth'
import { apiFetch, getAuthApiBaseUrl } from '../api'
import { isBackendAuthEnabled } from './authConfig'
import { AuthError } from './authErrors'
import {
  buildSession,
  clearAuthSession,
  expiresAtFromJwt,
  saveAuthSession,
} from './authSession'
import { localLogin, localRegister } from './localCredentialsStore'

type BackendUser = {
  id: number | string
  name: string
  email: string
  role?: 'USER' | 'SUPER_ADMIN'
  status?: 'ACTIVE' | 'BLOCKED'
}

type BackendLoginResponse = {
  token: string
  user: BackendUser
  expiresAt?: string
}

type BackendErrorBody = {
  message?: string
  errors?: Record<string, string>
}

function mapBackendUser(user: BackendUser): AuthUser {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role ?? 'USER',
    status: user.status ?? 'ACTIVE',
  }
}

function toAuthSession(payload: BackendLoginResponse): AuthSession {
  const expiresAt =
    payload.expiresAt && payload.expiresAt.length > 0
      ? payload.expiresAt
      : expiresAtFromJwt(payload.token)

  return {
    token: payload.token,
    user: mapBackendUser(payload.user),
    expiresAt,
  }
}

async function parseAuthFailure(res: Response): Promise<AuthError> {
  const body = (await res.json().catch(() => null)) as BackendErrorBody | null
  const message = body?.message ?? `Authentication request failed (${res.status}).`
  return new AuthError(message, { status: res.status, fieldErrors: body?.errors })
}

async function authFetch(path: string, init: RequestInit): Promise<Response> {
  const url = `${getAuthApiBaseUrl()}${path}`
  try {
    return await fetch(url, init)
  } catch {
    throw new AuthError(
      'Unable to reach TaskFlow server. Check that the backend is running and VITE_API_BASE_URL is correct.',
    )
  }
}

async function loginViaBackend(credentials: LoginCredentials): Promise<AuthSession> {
  const rememberMe = Boolean(credentials.rememberMe)
  const res = await authFetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email.trim(),
      password: credentials.password,
    }),
  })

  if (!res.ok) {
    throw await parseAuthFailure(res)
  }

  const payload = (await res.json()) as BackendLoginResponse
  if (!payload?.token || !payload.user) {
    throw new AuthError('Invalid login response from server.')
  }

  const session = toAuthSession(payload)
  saveAuthSession(session, rememberMe)
  return session
}

async function registerViaBackend(credentials: RegisterCredentials): Promise<void> {
  const res = await authFetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: credentials.name.trim(),
      email: credentials.email.trim(),
      password: credentials.password,
    }),
  })

  if (!res.ok) {
    throw await parseAuthFailure(res)
  }
}

/** Validates JWT with Spring Boot and returns the current user profile. */
export async function getCurrentUser(): Promise<AuthUser> {
  const user = await apiFetch<BackendUser>('/api/auth/me')
  return mapBackendUser(user)
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  if (isBackendAuthEnabled()) {
    return loginViaBackend(credentials)
  }

  const rememberMe = Boolean(credentials.rememberMe)
  const user = await localLogin(credentials.email, credentials.password)
  const session = buildSession(user, rememberMe)
  saveAuthSession(session, rememberMe)
  return session
}

export async function register(credentials: RegisterCredentials): Promise<AuthSession> {
  if (isBackendAuthEnabled()) {
    await registerViaBackend(credentials)
    return loginViaBackend({
      email: credentials.email,
      password: credentials.password,
      rememberMe: true,
    })
  }

  const user = await localRegister(credentials)
  const session = buildSession(user, true)
  saveAuthSession(session, true)
  return session
}

export async function logout(): Promise<void> {
  clearAuthSession()
}

export { isBackendAuthEnabled } from './authConfig'
