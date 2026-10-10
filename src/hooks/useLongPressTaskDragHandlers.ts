import { useCallback, useRef } from 'react'

const LONG_PRESS_MS = 1000
const MOVE_CANCEL_PX = 10

interface UseLongPressTaskDragHandlersOptions {
  enabled: boolean
  onLongPress: (taskId: number, point: { x: number; y: number }) => void
}

export function useLongPressTaskDragHandlers({
  enabled,
  onLongPress,
}: UseLongPressTaskDragHandlersOptions) {
  const timerRef = useRef<number | null>(null)
  const startRef = useRef<{ x: number; y: number; taskId: number } | null>(null)
  const suppressClickRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const bind = useCallback(
    (taskId: number) => {
      if (!enabled) {
        return {}
      }

      return {
        onTouchStart: (event: React.TouchEvent) => {
          if (event.touches.length !== 1) return
          clearTimer()
          const touch = event.touches[0]
          startRef.current = { x: touch.clientX, y: touch.clientY, taskId }
          timerRef.current = window.setTimeout(() => {
            timerRef.current = null
            const origin = startRef.current
            suppressClickRef.current = true
            if (origin) {
              onLongPress(taskId, { x: origin.x, y: origin.y })
            }
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(12)
            }
          }, LONG_PRESS_MS)
        },
        onTouchMove: (event: React.TouchEvent) => {
          if (!startRef.current || timerRef.current == null) return
          const touch = event.touches[0]
          const dx = touch.clientX - startRef.current.x
          const dy = touch.clientY - startRef.current.y
          if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
            clearTimer()
            startRef.current = null
          }
        },
        onTouchEnd: () => {
          clearTimer()
          startRef.current = null
        },
        onTouchCancel: () => {
          clearTimer()
          startRef.current = null
        },
        onClick: (event: React.MouseEvent) => {
          if (suppressClickRef.current) {
            event.preventDefault()
            event.stopPropagation()
            suppressClickRef.current = false
          }
        },
      }
    },
    [clearTimer, enabled, onLongPress],
  )

  return bind
}
