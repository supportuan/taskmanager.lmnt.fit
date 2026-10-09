import { ForwardedTaskCard } from '../components/forwarded/ForwardedTaskCard'
import { ForwardedTasksEmptyState } from '../components/forwarded/ForwardedTasksEmptyState'
import { ForwardedTasksHeader } from '../components/forwarded/ForwardedTasksHeader'
import { ForwardedTasksToolbar } from '../components/forwarded/ForwardedTasksToolbar'
import { useForwardedTasksPage } from '../hooks/useForwardedTasksPage'

export function ForwardedTasks() {
  const {
    loading,
    error,
    completeError,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    displayedTasks,
    forwardedCount,
    completingId,
    completeTask,
  } = useForwardedTasksPage()

  const showSearchEmpty = !loading && !error && forwardedCount > 0 && displayedTasks.length === 0
  const showGlobalEmpty = !loading && !error && forwardedCount === 0

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 pb-4 xl:gap-6">
      <ForwardedTasksHeader />

      <ForwardedTasksToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      {error ? (
        <p
          className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {completeError ? (
        <p
          className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
          role="alert"
        >
          {completeError}
        </p>
      ) : null}

      {loading ? (
        <p className="py-12 text-center text-sm text-text-muted">Loading forwarded tasks…</p>
      ) : showGlobalEmpty ? (
        <ForwardedTasksEmptyState variant="none" />
      ) : showSearchEmpty ? (
        <ForwardedTasksEmptyState variant="search" />
      ) : (
        <ul className="flex flex-col gap-4">
          {displayedTasks.map((task) => (
            <li key={task.id}>
              <ForwardedTaskCard
                task={task}
                completing={completingId === task.id}
                onComplete={completeTask}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
