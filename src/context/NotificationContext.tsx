import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'

export interface AppNotification {
  id: string
  title: string
  body?: string
  createdAt: string
}

interface NotificationContextValue {
  notifications: AppNotification[]
  hasUnread: boolean
  clearAll: () => void
  dismissNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

const STORAGE_PREFIX = 'taskflow-notifications-v1:'

function loadNotifications(userId: string): AppNotification[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AppNotification[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveNotifications(userId: string, items: AppNotification[]): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id != null ? String(user.id) : null
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      return
    }
    setNotifications(loadNotifications(userId))
  }, [userId])

  useEffect(() => {
    if (!userId) return
    saveNotifications(userId, notifications)
  }, [userId, notifications])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const hasUnread = notifications.length > 0

  const value = useMemo(
    () => ({
      notifications,
      hasUnread,
      clearAll,
      dismissNotification,
    }),
    [notifications, hasUnread, clearAll, dismissNotification],
  )

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
