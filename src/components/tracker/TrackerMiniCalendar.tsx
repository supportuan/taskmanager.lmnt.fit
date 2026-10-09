import { CalendarCard } from '../dashboard/CalendarCard'

interface TrackerMiniCalendarProps {
  viewMonth: Date
  grid: {
    date: Date
    iso: string
    inCurrentMonth: boolean
  }[]
  selectedIso: string
  onPrevMonth: () => void
  onNextMonth: () => void
  onSelectDate: (iso: string, date: Date) => void
  isToday: (date: Date) => boolean
}

/** Reuses Dashboard calendar styling — compact wrapper for Task Tracker. */
export function TrackerMiniCalendar(props: TrackerMiniCalendarProps) {
  return (
    <div className="tracker-mini-calendar min-w-0">
      <CalendarCard {...props} tasks={[]} />
    </div>
  )
}
