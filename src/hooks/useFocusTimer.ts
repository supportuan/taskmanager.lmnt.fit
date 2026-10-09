import { useCallback, useEffect, useMemo, useState } from 'react'
import { LONG_BREAK_MIN, SHORT_BREAK_MIN } from '../utils/focusUtils'

export type FocusTimerMode = 'focus' | 'short_break' | 'long_break'

export interface FocusTimerPersisted {
  mode: FocusTimerMode
  durationSeconds: number
  endTimestamp: number | null
  pausedRemainingSeconds: number
  isRunning: boolean
  sessionComplete: boolean
}

const STORAGE_KEY = 'taskflow-focus-timer-v1'

function defaultDuration(mode: FocusTimerMode): number {
  if (mode === 'short_break') return SHORT_BREAK_MIN * 60
  if (mode === 'long_break') return LONG_BREAK_MIN * 60
  return 25 * 60
}

function loadPersisted(): FocusTimerPersisted {
  const base: FocusTimerPersisted = {
    mode: 'focus',
    durationSeconds: 25 * 60,
    endTimestamp: null,
    pausedRemainingSeconds: 25 * 60,
    isRunning: false,
    sessionComplete: false,
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as FocusTimerPersisted
    if (parsed.isRunning && parsed.endTimestamp) {
      const remaining = Math.max(0, Math.ceil((parsed.endTimestamp - Date.now()) / 1000))
      if (remaining <= 0) {
        return {
          ...parsed,
          isRunning: false,
          endTimestamp: null,
          pausedRemainingSeconds: 0,
          sessionComplete: true,
        }
      }
    }
    return { ...base, ...parsed }
  } catch {
    return base
  }
}

function savePersisted(state: FocusTimerPersisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

function computeRemaining(state: FocusTimerPersisted): number {
  if (state.isRunning && state.endTimestamp != null) {
    return Math.max(0, Math.ceil((state.endTimestamp - Date.now()) / 1000))
  }
  return Math.max(0, state.pausedRemainingSeconds)
}

export function useFocusTimer() {
  const [state, setState] = useState<FocusTimerPersisted>(() => loadPersisted())
  const [tick, setTick] = useState(0)

  useEffect(() => {
    savePersisted(state)
  }, [state])

  useEffect(() => {
    if (!state.isRunning) return
    const id = window.setInterval(() => setTick((t) => t + 1), 250)
    return () => window.clearInterval(id)
  }, [state.isRunning])

  const remainingSeconds = useMemo(() => {
    void tick
    return computeRemaining(state)
  }, [state, tick])

  useEffect(() => {
    if (!state.isRunning || state.sessionComplete) return
    if (remainingSeconds <= 0) {
      setState((s) => ({
        ...s,
        isRunning: false,
        endTimestamp: null,
        pausedRemainingSeconds: 0,
        sessionComplete: true,
      }))
    }
  }, [remainingSeconds, state.isRunning, state.sessionComplete])

  const setMode = useCallback((mode: FocusTimerMode) => {
    const duration = defaultDuration(mode)
    setState({
      mode,
      durationSeconds: duration,
      endTimestamp: null,
      pausedRemainingSeconds: duration,
      isRunning: false,
      sessionComplete: false,
    })
  }, [])

  const setFocusDurationMinutes = useCallback((minutes: number) => {
    const duration = Math.max(60, minutes * 60)
    setState((s) => ({
      ...s,
      durationSeconds: duration,
      pausedRemainingSeconds: duration,
      endTimestamp: null,
      isRunning: false,
      sessionComplete: false,
    }))
  }, [])

  const start = useCallback(() => {
    setState((s) => {
      const remaining =
        s.sessionComplete || s.pausedRemainingSeconds <= 0
          ? s.durationSeconds
          : s.pausedRemainingSeconds
      return {
        ...s,
        sessionComplete: false,
        isRunning: true,
        pausedRemainingSeconds: remaining,
        endTimestamp: Date.now() + remaining * 1000,
      }
    })
  }, [])

  const pause = useCallback(() => {
    setState((s) => {
      const remaining = computeRemaining(s)
      return {
        ...s,
        isRunning: false,
        endTimestamp: null,
        pausedRemainingSeconds: remaining,
      }
    })
  }, [])

  const reset = useCallback(() => {
    setState((s) => ({
      ...s,
      isRunning: false,
      endTimestamp: null,
      pausedRemainingSeconds: s.durationSeconds,
      sessionComplete: false,
    }))
  }, [])

  const dismissSessionComplete = useCallback(() => {
    setState((s) => ({
      ...s,
      sessionComplete: false,
      pausedRemainingSeconds: s.durationSeconds,
    }))
  }, [])

  const progressRatio = useMemo(() => {
    if (state.durationSeconds <= 0) return 0
    return Math.min(1, 1 - remainingSeconds / state.durationSeconds)
  }, [remainingSeconds, state.durationSeconds])

  return {
    mode: state.mode,
    durationSeconds: state.durationSeconds,
    remainingSeconds,
    isRunning: state.isRunning,
    sessionComplete: state.sessionComplete,
    progressRatio,
    setMode,
    setFocusDurationMinutes,
    start,
    pause,
    reset,
    dismissSessionComplete,
  }
}
