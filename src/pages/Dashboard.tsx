import { useMemo } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { CalendarCard } from '../components/dashboard/CalendarCard'
import { ProductivitySnapshot } from '../components/dashboard/ProductivitySnapshot'
import { ScheduleTimeline } from '../components/dashboard/ScheduleTimeline'
import { TaskPreview } from '../components/dashboard/TaskPreview'
import { DailyMomentumBlock } from '../components/layout/DailyMomentumBlock'
import { useCalendar } from '../hooks/useCalendar'
import { useTasks } from '../hooks/useTasks'
import { formatISODate } from '../utils/dateUtils'

interface ShellContext {
  searchQuery: string
  setSearchQuery: (value: string) => void
}

export function Dashboard() {
  const navigate = useNavigate()
  const { searchQuery } = useOutletContext<ShellContext>()
  const { grid, viewMonth, selectedIso, goToPreviousMonth, goToNextMonth, selectDate, isToday } =
    useCalendar()

  const {
    tasks,
    scheduleItems,
    scheduleMode,
    setScheduleMode,
    selectedTask,
    selectedTaskId,
    selectTask,
    startTask,
    productivityStats,
    loading,
    error,
  } = useTasks(selectedIso)

  const isSelectedToday = selectedIso === formatISODate(new Date())

  const filteredScheduleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return scheduleItems
    return scheduleItems.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)),
    )
  }, [scheduleItems, searchQuery])

  return (
    <div className="dashboard-page flex w-full min-w-0 flex-col gap-3 xl:gap-4">
      {error && (
        <p
          className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="dashboard-main-grid mt-4 min-w-0 lg:mt-[50px]">
        <div className="min-w-0" style={{ gridArea: 'calendar' }}>
          <CalendarCard
            viewMonth={viewMonth}
            grid={grid}
            selectedIso={selectedIso}
            tasks={loading ? [] : tasks}
            onPrevMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onSelectDate={selectDate}
            onDoubleClickDate={(iso) => {
              navigate(`/add-task?date=${encodeURIComponent(iso)}`)
            }}
            isToday={isToday}
          />
        </div>

        <div className="min-w-0" style={{ gridArea: 'productivity' }}>
          <ProductivitySnapshot compact stats={productivityStats} loading={loading} />
        </div>

        <div className="min-w-0" style={{ gridArea: 'schedule' }}>
          <ScheduleTimeline
            items={loading ? [] : filteredScheduleItems}
            selectedTaskId={selectedTaskId}
            selectedDateIso={selectedIso}
            isSelectedToday={isSelectedToday}
            scheduleMode={scheduleMode}
            onScheduleModeChange={setScheduleMode}
            onSelectTask={selectTask}
          />
        </div>

        <div className="min-w-0" style={{ gridArea: 'preview' }}>
          <TaskPreview
            task={loading ? undefined : selectedTask}
            hasTasks={!loading && tasks.length > 0}
            onStartTask={startTask}
          />
        </div>
      </div>

      <div className="min-w-0 lg:hidden">
        <DailyMomentumBlock className="mt-1" />
      </div>
    </div>
  )
}
