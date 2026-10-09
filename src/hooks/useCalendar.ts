import { useCallback, useMemo, useState } from 'react'
import {
  formatISODate,
  getCalendarGrid,
  isSameDay,
  parseISODate,
} from '../utils/dateUtils'

export function useCalendar(initialSelectedIso?: string) {
  const today = useMemo(() => new Date(), [])
  const [viewMonth, setViewMonth] = useState(() => {
    if (initialSelectedIso) return parseISODate(initialSelectedIso)
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [selectedIso, setSelectedIso] = useState(
    () => initialSelectedIso ?? formatISODate(today),
  )

  const grid = useMemo(() => getCalendarGrid(viewMonth), [viewMonth])
  const selectedDate = useMemo(() => parseISODate(selectedIso), [selectedIso])

  const goToPreviousMonth = useCallback(() => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }, [])

  const goToNextMonth = useCallback(() => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }, [])

  const selectDate = useCallback((iso: string, date: Date) => {
    setSelectedIso(iso)
    setViewMonth(new Date(date.getFullYear(), date.getMonth(), 1))
  }, [])

  const isToday = useCallback((date: Date) => isSameDay(date, today), [today])

  return {
    today,
    viewMonth,
    grid,
    selectedIso,
    selectedDate,
    goToPreviousMonth,
    goToNextMonth,
    selectDate,
    isToday,
  }
}
