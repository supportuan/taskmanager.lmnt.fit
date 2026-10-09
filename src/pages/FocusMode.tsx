import { useEffect, useState } from 'react'
import { AnalyticsTasksErrorState } from '../components/analytics/AnalyticsTasksErrorState'
import { StatusBanner } from '../components/common/StatusBanner'
import { CompletionReflectionModal } from '../components/tracker/CompletionReflectionModal'
import { PauseTaskModal } from '../components/tracker/PauseTaskModal'
import { FocusCurrentTaskCard } from '../components/focus/FocusCurrentTaskCard'
import { FocusModeHeader } from '../components/focus/FocusModeHeader'
import { FocusNextTaskCard } from '../components/focus/FocusNextTaskCard'
import { FocusTaskProgress } from '../components/focus/FocusTaskProgress'
import { FocusTimerCard } from '../components/focus/FocusTimerCard'
import { GlassCard } from '../components/layout/GlassCard'
import { useFocusMode } from '../hooks/useFocusMode'
import { todayFocusSeconds, focusSessionsToday } from '../utils/focusSessions'

export function FocusMode() {
  const {
    currentTask,
    nextTask,
    displayElapsed,
    displayProgress,
    remainingTaskSeconds,
    focusTimer,
    useTaskAwareDisplay,
    timerRemaining,
    timerDuration,
    timerRunning,
    timerProgressRatio,
    timerSessionComplete,
    headerFocusRunning,
    headerFocusPaused,
    startFocus,
    pauseFocus,
    resumeFocus,
    resetFocus,
    startTask,
    resumeTask,
    openPauseModal,
    requestComplete,
    finalizeComplete,
    cancelTaskCompletion,
    pendingTask,
    pauseModalOpen,
    cancelPauseModal,
    confirmPause,
    executionError,
    executionBusy,
    tasksLoading,
    tasksLoadError,
    hasOpenTasks,
    retrying,
    handleRetryLoad,
    onModeChange,
  } = useFocusMode()

  const [banner, setBanner] = useState<{ message: string; tone: 'success' | 'error' } | null>(
    null,
  )

  useEffect(() => {
    if (!executionError) return
    setBanner({ message: executionError, tone: 'error' })
  }, [executionError])

  useEffect(() => {
    if (!banner) return
    const id = window.setTimeout(() => setBanner(null), 3200)
    return () => window.clearTimeout(id)
  }, [banner])

  const sessionsToday = focusSessionsToday().length
  const focusSecondsToday = todayFocusSeconds()

  if (tasksLoading) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-5 pb-4 xl:gap-6">
        <FocusModeHeader
          workflow={undefined}
          focusRunning={false}
          focusPaused={false}
          sessionComplete={false}
        />
        <GlassCard tier="secondary" className="px-6 py-14 text-center text-sm text-text-secondary">
          Loading your tasks…
        </GlassCard>
      </div>
    )
  }

  if (tasksLoadError) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-5 pb-4 xl:gap-6">
        <FocusModeHeader
          workflow={undefined}
          focusRunning={false}
          focusPaused={false}
          sessionComplete={false}
        />
        <AnalyticsTasksErrorState
          title="Couldn't load your tasks"
          message={tasksLoadError}
          onRetry={() => void handleRetryLoad()}
          retrying={retrying}
        />
      </div>
    )
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 pb-4 xl:gap-6">
      {banner ? <StatusBanner message={banner.message} tone={banner.tone} /> : null}

      <FocusModeHeader
        workflow={currentTask?.workflowStatus}
        focusRunning={headerFocusRunning}
        focusPaused={headerFocusPaused}
        sessionComplete={timerSessionComplete && !useTaskAwareDisplay}
      />

      {(sessionsToday > 0 || focusSecondsToday > 0) && (
        <p className="text-xs text-text-muted">
          Focus sessions today: {sessionsToday}
          {focusSecondsToday > 0
            ? ` · ${Math.floor(focusSecondsToday / 3600)}h ${Math.floor((focusSecondsToday % 3600) / 60)}m focus time`
            : null}
        </p>
      )}

      <div className="focus-mode-grid min-w-0">
        <section className="focus-area-timer" aria-label="Focus timer">
          <FocusTimerCard
            mode={focusTimer.mode}
            remainingSeconds={timerRemaining}
            durationSeconds={timerDuration}
            progressRatio={timerProgressRatio}
            isRunning={timerRunning}
            sessionComplete={timerSessionComplete}
            hasTask={Boolean(currentTask && currentTask.workflowStatus !== 'completed')}
            taskAware={useTaskAwareDisplay}
            onModeChange={onModeChange}
            onDurationChange={focusTimer.setFocusDurationMinutes}
            onStart={startFocus}
            onPause={pauseFocus}
            onResume={resumeFocus}
            onReset={resetFocus}
            onCompleteTask={requestComplete}
            onContinueSession={() => {
              focusTimer.dismissSessionComplete()
              focusTimer.reset()
            }}
            onStartBreak={() => {
              focusTimer.dismissSessionComplete()
              focusTimer.setMode('short_break')
              focusTimer.start()
            }}
          />
        </section>

        <section className="focus-area-current" aria-label="Current task">
          <FocusCurrentTaskCard
            task={currentTask}
            emptyList={!hasOpenTasks}
            disabled={executionBusy}
            onStart={() => void startTask()}
            onPause={openPauseModal}
            onResume={() => void resumeTask()}
            onComplete={requestComplete}
          />
        </section>

        <section className="focus-area-progress" aria-label="Task progress">
          <FocusTaskProgress
            progress={displayProgress}
            elapsedSeconds={displayElapsed}
            plannedMinutes={currentTask?.durationMinutes ?? 0}
            remainingSeconds={remainingTaskSeconds}
            hasTask={Boolean(currentTask)}
          />
        </section>

        <section className="focus-area-next" aria-label="Next task">
          <FocusNextTaskCard task={nextTask} />
        </section>
      </div>

      {pauseModalOpen && currentTask ? (
        <PauseTaskModal
          open
          task={currentTask}
          onClose={cancelPauseModal}
          onConfirm={(values) => void confirmPause(values)}
          busy={executionBusy}
        />
      ) : null}

      {pendingTask ? (
        <CompletionReflectionModal
          task={pendingTask}
          open
          onClose={cancelTaskCompletion}
          onSave={(reflection) => void finalizeComplete(reflection)}
        />
      ) : null}
    </div>
  )
}
