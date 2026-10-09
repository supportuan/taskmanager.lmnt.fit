import { useCallback, useEffect, useRef, useState } from 'react'

export function useTaskTimer(isRunning: boolean) {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = window.setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning])

  const reset = useCallback((value = 0) => setElapsed(value), [])
  const sync = useCallback((value: number) => setElapsed(value), [])

  return { elapsed, reset, sync, setElapsed }
}
