import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { StatusBanner } from '../components/common/StatusBanner'
import { CompletionReflectionModal } from '../components/tracker/CompletionReflectionModal'
import { PauseTaskModal } from '../components/tracker/PauseTaskModal'
import { CompletedTasksCard } from '../components/tracker/CompletedTasksCard'
import { CurrentTaskCard } from '../components/tracker/CurrentTaskCard'
import { NextTasksCard } from '../components/tracker/NextTasksCard'
import { QuickControls } from '../components/tracker/QuickControls'
import { TaskTrackerHeader } from '../components/tracker/TaskTrackerHeader'
import { TimelineCard } from '../components/tracker/TimelineCard'
import { TrackerMiniCalendar } from '../components/tracker/TrackerMiniCalendar'
import { useCalendar } from '../hooks/useCalendar'
import { useTaskTracker } from '../hooks/useTaskTracker'

interface ShellContext {
  searchQuery: string
}

export function TaskTracker() {
  const { searchQuery } = useOutletContext<ShellContext>()
  const [now, setNow] = useState(() => new Date())
  const [banner, setBanner] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null,
  )

  const {
    selectedIso,
    setSelectedIso,
    currentTask,
    currentTaskId,
    displayElapsed,
    displayProgress,
    nextSix,
    completedForDay,
    completeTaskFromDrag,
    timelineTasks,
    pauseModalOpen,
    openPauseModal,
    cancelPauseModal,
    confirmPause,
    goPrevDay,
    goNextDay,
    goToday,
    selectTask,
    startTask,
    resumeTask,
    requestComplete,
    finalizeComplete,
    cancelTaskCompletion,
    pendingTask,
    skipTask,
    executionError,
    executionBusy,
  } = useTaskTracker(searchQuery)

  const {
    grid,
    viewMonth,
    goToPreviousMonth,
    goToNextMonth,
    selectDate,
    isToday,
  } = useCalendar(selectedIso)

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!banner) return
    const id = window.setTimeout(() => setBanner(null), 3200)
    return () => window.clearTimeout(id)
  }, [banner])

  useEffect(() => {
    if (!executionError) return
    setBanner({ message: executionError, tone: 'error' })
  }, [executionError])

  const onCalendarSelect = (iso: string, date: Date) => {
    selectDate(iso, date)
    setSelectedIso(iso)
  }

  const onDropComplete = (taskId: number) => {
    const result = completeTaskFromDrag(taskId)
    if (!result.ok) {
      setBanner({ message: result.message, tone: 'error' })
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 pb-4 xl:gap-6">
      <TaskTrackerHeader />

      <div className="task-tracker-grid min-w-0">
        <section className="task-tracker-area-current flex min-w-0 flex-col gap-4" aria-label="Current task">
          <CurrentTaskCard
            task={currentTask}
            displayElapsed={displayElapsed}
            displayProgress={displayProgress}
            footer={
              <QuickControls
                embedded
                task={currentTask}
                disabled={executionBusy}
                onStart={() => void startTask()}
                onPause={openPauseModal}
                onResume={() => void resumeTask()}
                onComplete={requestComplete}
                onSkip={skipTask}
              />
            }
          />
        </section>

        <section className="task-tracker-area-next min-w-0" aria-label="Next tasks">
          <NextTasksCard
            tasks={nextSix}
            currentTaskId={currentTaskId}
            onSelect={selectTask}
            draggable
          />
        </section>

        <section className="task-tracker-area-completed min-w-0" aria-label="Completed tasks">
          <CompletedTasksCard
            tasks={completedForDay}
            onDropTaskId={(id) => {
              void onDropComplete(id)
            }}
          />
        </section>

        <section
          className="task-tracker-area-timeline flex min-w-0 flex-col gap-4"
          aria-label="Timeline and calendar"
        >
          <TimelineCard
            selectedIso={selectedIso}
            tasks={timelineTasks}
            currentTaskId={currentTaskId}
            currentProgress={displayProgress}
            now={now}
            onPrevDay={goPrevDay}
            onNextDay={goNextDay}
            onToday={goToday}
            onSelectTask={selectTask}
          />
          <TrackerMiniCalendar
            viewMonth={viewMonth}
            grid={grid}
            selectedIso={selectedIso}
            onPrevMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onSelectDate={onCalendarSelect}
            isToday={isToday}
          />
        </section>
      </div>

      {currentTask && pauseModalOpen ? (
        <PauseTaskModal
          task={currentTask}
          open
          busy={executionBusy}
          onClose={cancelPauseModal}
          onConfirm={(values) => void confirmPause(values)}
        />
      ) : null}

      {pendingTask ? (
        <CompletionReflectionModal
          task={pendingTask}
          open
          onClose={cancelTaskCompletion}
          onSave={(payload) => void finalizeComplete(payload)}
        />
      ) : null}

      {banner ? <StatusBanner message={banner.message} tone={banner.tone} /> : null}
    </div>
  )
}
