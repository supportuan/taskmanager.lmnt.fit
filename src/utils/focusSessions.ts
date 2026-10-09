const STORAGE_KEY = 'taskflow-focus-sessions-v1'

export interface FocusSessionRecord {
  id: string
  taskId: number | null
  mode: 'focus' | 'short_break' | 'long_break'
  startedAt: string
  endedAt: string
  plannedDurationSeconds: number
  actualDurationSeconds: number
}

function readAll(): FocusSessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as FocusSessionRecord[]
  } catch {
    return []
  }
}

export function appendFocusSession(record: Omit<FocusSessionRecord, 'id'>) {
  const next: FocusSessionRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }
  const all = readAll()
  all.push(next)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(-200)))
  } catch {
    /* ignore */
  }
}

export function focusSessionsToday(reference = new Date()): FocusSessionRecord[] {
  const day = reference.toISOString().slice(0, 10)
  return readAll().filter((s) => s.mode === 'focus' && s.startedAt.slice(0, 10) === day)
}

export function todayFocusSeconds(reference = new Date()): number {
  return focusSessionsToday(reference).reduce((sum, s) => sum + s.actualDurationSeconds, 0)
}
