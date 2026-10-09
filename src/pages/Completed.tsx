import { useOutletContext } from 'react-router-dom'
import { AchievementStreak } from '../components/completed/AchievementStreak'
import { CompletedEmptyState } from '../components/completed/CompletedEmptyState'
import { CompletedHeader } from '../components/completed/CompletedHeader'
import { CompletedTaskList } from '../components/completed/CompletedTaskList'
import { TaskSummaryPanel } from '../components/completed/TaskSummaryPanel'
import { TimePerformance } from '../components/completed/TimePerformance'
import { useCompletedPage } from '../hooks/useCompletedPage'
import { useMarkTaskNotCompleted } from '../hooks/useMarkTaskNotCompleted'

interface ShellContext {
  searchQuery: string
}

export function Completed() {
  const { searchQuery } = useOutletContext<ShellContext>()
  const {
    dateFilter,
    setDateFilter,
    filteredTasks,
    selectedTask,
    selectTask,
    performance,
    streaks,
    isEmpty,
  } = useCompletedPage(searchQuery)

  const { markNotCompleted, busyTaskId, error: notCompletedError } = useMarkTaskNotCompleted()

  if (isEmpty) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-5 pb-4 xl:gap-6">
        <CompletedHeader />
        <CompletedEmptyState />
      </div>
    )
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 pb-4 xl:gap-6">
      <CompletedHeader />

      {notCompletedError ? (
        <p
          className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
          role="alert"
        >
          {notCompletedError}
        </p>
      ) : null}

      <div className="completed-page-grid min-w-0">
        <div className="completed-area-main flex min-w-0 flex-col gap-4">
          <section aria-label="Completed task list">
            <CompletedTaskList
              tasks={filteredTasks}
              selectedId={selectedTask?.id}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              onSelect={selectTask}
            />
          </section>
          <section aria-label="Task summary">
            <TaskSummaryPanel
              task={selectedTask}
              performance={performance}
              onMarkNotCompleted={
                selectedTask
                  ? () => {
                      void markNotCompleted(selectedTask)
                    }
                  : undefined
              }
              markNotCompletedBusy={selectedTask != null && busyTaskId === selectedTask.id}
            />
          </section>
        </div>

        <div className="completed-area-side flex min-w-0 flex-col gap-4">
          <section aria-label="Time performance">
            <TimePerformance metrics={performance} />
          </section>
          <section aria-label="Achievements and streak">
            <AchievementStreak streaks={streaks} performance={performance} />
          </section>
        </div>
      </div>
    </div>
  )
}
