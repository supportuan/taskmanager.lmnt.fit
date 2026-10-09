import type { AuthSession } from '../../types/auth'

const SESSION_KEY = 'taskflow-auth-session'
const REMEMBER_FLAG_KEY = 'taskflow-auth-remember'

export const UNAUTHORIZED_EVENT = 'taskflow:unauthorized'

function readStorage(persistent: boolean): Storage {
  return persistent ? localStorage : sessionStorage
}

export function getRememberMePreference(): boolean {
  try {
    return localStorage.getItem(REMEMBER_FLAG_KEY) === '1'
  } catch {
    return false
  }
}

export function loadAuthSession(): AuthSession | null {
  try {
    const persistent = getRememberMePreference()
    const raw =
      readStorage(persistent).getItem(SESSION_KEY) ??
      (persistent ? null : localStorage.getItem(SESSION_KEY))
    if (!raw) return null
    const session = JSON.parse(raw) as AuthSession
    if (!session?.token || !session?.user?.email || !session.expiresAt) {
      clearAuthSession()
      return null
    }
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      clearAuthSession()
      return null
    }
    return session
  } catch {
    clearAuthSession()
    return null
  }
}

export function saveAuthSession(session: AuthSession, rememberMe: boolean): void {
  try {
    localStorage.setItem(REMEMBER_FLAG_KEY, rememberMe ? '1' : '0')
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_KEY)
    readStorage(rememberMe).setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    /* storage unavailable */
  }
}

export function clearAuthSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(REMEMBER_FLAG_KEY)
  } catch {
    /* ignore */
  }
}

export function notifyUnauthorized(): void {
  clearAuthSession()
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
}

export function createSessionToken(): string {
  return crypto.randomUUID()
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14

export function buildSession(user: AuthSession['user'], rememberMe: boolean): AuthSession {
  const ttl = rememberMe ? SESSION_TTL_MS : 1000 * 60 * 60 * 12
  return {
    token: createSessionToken(),
    user,
    expiresAt: new Date(Date.now() + ttl).toISOString(),
  }
}

export function expiresAtFromJwt(token: string, fallbackMs = 43_200_000): string {
  try {
    const segment = token.split('.')[1]
    if (!segment) throw new Error('invalid jwt')
    const payload = JSON.parse(atob(segment.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number }
    if (typeof payload.exp === 'number') {
      return new Date(payload.exp * 1000).toISOString()
    }
  } catch {
    /* use fallback */
  }
  return new Date(Date.now() + fallbackMs).toISOString()
}
