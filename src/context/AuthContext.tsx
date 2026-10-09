import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiError } from '../services/api'
import * as authService from '../services/auth/authService'
import { isBackendAuthEnabled } from '../services/auth/authConfig'
import { AuthError, isNetworkError } from '../services/auth/authErrors'
import {
  clearAuthSession,
  getRememberMePreference,
  loadAuthSession,
  saveAuthSession,
  UNAUTHORIZED_EVENT,
} from '../services/auth/authSession'
import type { AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const session = loadAuthSession()
      if (!session) {
        if (!cancelled) {
          setUser(null)
          setIsBootstrapping(false)
        }
        return
      }

      setUser(session.user)

      if (isBackendAuthEnabled()) {
        try {
          const profile = await authService.getCurrentUser()
          if (cancelled) return
          saveAuthSession({ ...session, user: profile }, getRememberMePreference())
          setUser(profile)
        } catch (error) {
          if (cancelled) return
          if (error instanceof ApiError && error.status === 401) {
            clearAuthSession()
            setUser(null)
          }
        }
      }

      if (!cancelled) setIsBootstrapping(false)
    }

    void bootstrap()

    const onUnauthorized = () => {
      setUser(null)
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)

    return () => {
      cancelled = true
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const session = await authService.login(credentials)
    setUser(session.user)
  }, [])

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const session = await authService.register(credentials)
    setUser(session.user)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user != null,
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [user, isBootstrapping, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message
  if (error instanceof ApiError) return error.message
  if (isNetworkError(error)) {
    return 'Unable to reach TaskFlow server. Check that the backend is running.'
  }
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}

export function getAuthFieldErrors(error: unknown): Record<string, string> | undefined {
  if (error instanceof AuthError && error.fieldErrors) return error.fieldErrors
  if (error instanceof ApiError && error.fieldErrors) return error.fieldErrors
  return undefined
}
