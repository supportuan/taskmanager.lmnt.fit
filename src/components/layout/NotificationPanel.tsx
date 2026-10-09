import { Bell, X } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNotifications } from '../../context/NotificationContext'

const PANEL_WIDTH = 320
const PANEL_GAP = 10

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLButtonElement | null>
}

export function NotificationPanel({ open, onClose, anchorRef }: NotificationPanelProps) {
  const { notifications, clearAll, dismissNotification } = useNotifications()
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  const updatePosition = () => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const width = Math.min(PANEL_WIDTH, window.innerWidth - 16)
    const left = Math.min(
      Math.max(8, rect.right - width),
      window.innerWidth - width - 8,
    )
    setPos({ top: rect.bottom + PANEL_GAP, left })
  }

  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      return
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, anchorRef])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return
      onClose()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose, anchorRef])

  if (!open || !pos) return null

  return createPortal(
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-label="Notifications"
      className="glass-panel fixed z-[200] w-[min(320px,calc(100vw-2rem))] rounded-2xl p-4 shadow-[0_16px_48px_rgba(0,0,0,0.45)] animate-fade-up"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary-cyan" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-text-main">Notifications</h2>
        </div>
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-primary-cyan transition hover:text-white"
          >
            Clear all
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">No new notifications</p>
      ) : (
        <ul className="max-h-[min(360px,50vh)] space-y-2 overflow-y-auto pr-1">
          {notifications.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-main">{item.title}</p>
                  {item.body ? (
                    <p className="mt-0.5 text-xs text-text-muted">{item.body}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => dismissNotification(item.id)}
                  className="shrink-0 rounded-lg p-1 text-text-muted transition hover:bg-white/10 hover:text-text-main"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>,
    document.body,
  )
}
