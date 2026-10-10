import { useCallback, useEffect, useRef, useState } from 'react'
import { useMediaMaxLg } from '../hooks/useMediaMaxLg'
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
  const isMobileTablet = useMediaMaxLg()
  const completedDropRef = useRef<HTMLDivElement>(null)
  const [touchDragTaskId, setTouchDragTaskId] = useState<number | null>(null)
  const [touchDragPoint, setTouchDragPoint] = useState<{ x: number; y: number } | null>(null)
  const [touchOverDropZone, setTouchOverDropZone] = useState(false)
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

  const onDropComplete = useCallback((taskId: number) => {
    const result = completeTaskFromDrag(taskId)
    if (!result.ok) {
      setBanner({ message: result.message, tone: 'error' })
    }
  }, [completeTaskFromDrag])

  const endTouchDrag = useCallback(() => {
    setTouchDragTaskId(null)
    setTouchDragPoint(null)
    setTouchOverDropZone(false)
  }, [])

  const onTouchLongPress = useCallback((taskId: number, point: { x: number; y: number }) => {
    setTouchDragTaskId(taskId)
    setTouchDragPoint(point)
    setTouchOverDropZone(false)
  }, [])

  useEffect(() => {
    if (touchDragTaskId == null) return

    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      event.preventDefault()
      setTouchDragPoint({ x: touch.clientX, y: touch.clientY })
      const target = document.elementFromPoint(touch.clientX, touch.clientY)
      setTouchOverDropZone(Boolean(target && completedDropRef.current?.contains(target)))
    }

    const onEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0]
      if (touch) {
        const target = document.elementFromPoint(touch.clientX, touch.clientY)
        if (target && completedDropRef.current?.contains(target)) {
          onDropComplete(touchDragTaskId)
        }
      }
      endTouchDrag()
    }

    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onEnd)
    document.addEventListener('touchcancel', onEnd)
    return () => {
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onEnd)
    }
  }, [touchDragTaskId, endTouchDrag, onDropComplete])

  const touchDragTask = touchDragTaskId
    ? nextSix.find((task) => task.id === touchDragTaskId)
    : undefined

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
            touchDragEnabled={isMobileTablet}
            onTouchLongPress={onTouchLongPress}
            touchDraggingTaskId={touchDragTaskId}
          />
        </section>

        <section className="task-tracker-area-completed min-w-0" aria-label="Completed tasks">
          <CompletedTasksCard
            tasks={completedForDay}
            dropZoneRef={completedDropRef}
            touchDragOver={touchOverDropZone}
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

      {touchDragTaskId && touchDragPoint && touchDragTask ? (
        <div
          className="pointer-events-none fixed z-[400] max-w-[min(280px,calc(100vw-2rem))] rounded-xl border border-[rgba(52,175,255,0.55)] bg-[rgba(8,18,42,0.96)] px-3 py-2.5 shadow-glowBlue lg:hidden"
          style={{
            left: touchDragPoint.x,
            top: touchDragPoint.y,
            transform: 'translate(-50%, -50%)',
          }}
          aria-hidden
        >
          <p className="truncate text-sm font-medium text-white">{touchDragTask.title}</p>
          <p className="text-[11px] text-text-muted">Release over Task Completed</p>
        </div>
      ) : null}
    </div>
  )
}
