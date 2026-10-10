import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '../../types/task'
import { CALENDAR_WEEKDAY_LABELS, formatMonthYear } from '../../utils/dateUtils'
import {
  CALENDAR_PRIORITY_DOT_CLASS,
  getPriorityIndicatorsForDate,
} from '../../utils/dashboard/calendarPriorityIndicators'
import { GlassCard } from '../layout/GlassCard'

interface CalendarCardProps {
  viewMonth: Date
  grid: {
    date: Date
    iso: string
    inCurrentMonth: boolean
  }[]
  selectedIso: string
  tasks?: Task[]
  onPrevMonth: () => void
  onNextMonth: () => void
  onSelectDate: (iso: string, date: Date) => void
  onDoubleClickDate?: (iso: string, date: Date) => void
  isToday: (date: Date) => boolean
}

export function CalendarCard({
  viewMonth,
  grid,
  selectedIso,
  tasks = [],
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onDoubleClickDate,
  isToday,
}: CalendarCardProps) {
  return (
    <GlassCard
      tier="accent"
      className="dashboard-calendar-card p-4 sm:p-5 lg:p-6"
      glow="blue"
      style={{ animationDelay: '0.08s' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-main">{formatMonthYear(viewMonth)}</h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="calendar-nav-btn flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next month"
            className="calendar-nav-btn flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {CALENDAR_WEEKDAY_LABELS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[10px] font-semibold tracking-wider text-text-muted"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map(({ date, iso, inCurrentMonth }) => {
          const selected = iso === selectedIso
          const today = isToday(date)
          const indicators = getPriorityIndicatorsForDate(tasks, iso)

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso, date)}
              onDoubleClick={() => onDoubleClickDate?.(iso, date)}
              className={[
                'calendar-day relative flex min-h-[2.75rem] w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-full px-0.5 py-1 text-xs font-medium sm:min-h-[2.5rem]',
                !inCurrentMonth && 'text-text-muted/40',
                inCurrentMonth && !selected && 'text-text-secondary',
                today && !selected && 'ring-1 ring-[rgba(37,200,255,0.4)]',
                selected && 'calendar-day-selected',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`Select ${iso}`}
              aria-pressed={selected}
            >
              <span className="leading-none">{date.getDate()}</span>
              {indicators.length > 0 ? (
                <span className="flex items-center gap-[3px]" aria-hidden>
                  {indicators.map((priority) => (
                    <span key={priority} className={CALENDAR_PRIORITY_DOT_CLASS[priority]} />
                  ))}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </GlassCard>
  )
}
