import { loadAuthSession, notifyUnauthorized } from './auth/authSession'

function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/$/, '')
  }
  return 'http://localhost:8080'
}

const API_BASE = resolveApiBaseUrl()

export function getApiBaseUrl(): string {
  return API_BASE
}

export function getAuthApiBaseUrl(): string {
  const explicit = import.meta.env.VITE_AUTH_API_URL
  if (explicit) return explicit.replace(/\/$/, '')
  return `${API_BASE}/api/auth`
}

export class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string>

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }
  const sendAuth = options.auth !== false
  if (sendAuth) {
    const session = loadAuthSession()
    if (session?.token) {
      headers.set('Authorization', `Bearer ${session.token}`)
    }
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

  let res: Response
  try {
    res = await fetch(url, { ...init, headers })
  } catch {
    throw new ApiError('Unable to reach TaskFlow server. Check that the backend is running.', 0)
  }

  const body = (await res.json().catch(() => null)) as
    | { message?: string; errors?: Record<string, string> }
    | T
    | null

  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'message' in body && body.message
        ? String(body.message)
        : `Request failed (${res.status})`
    const fieldErrors =
      body && typeof body === 'object' && 'errors' in body && body.errors
        ? body.errors
        : undefined

    if (res.status === 401 && sendAuth) {
      const isAuthEndpoint =
        url.includes('/api/auth/login') ||
        url.includes('/api/auth/register') ||
        url.includes('/api/auth/logout')
      if (!isAuthEndpoint) {
        notifyUnauthorized()
      }
    }

    throw new ApiError(message, res.status, fieldErrors)
  }

  return body as T
}
