import { ChevronDown, ChevronRight, Shield } from 'lucide-react'
import { AnalyticsTasksErrorState } from '../components/analytics/AnalyticsTasksErrorState'
import { Button } from '../components/common/Button'
import { GlassCard } from '../components/layout/GlassCard'
import { useAuth } from '../context/AuthContext'
import { useSuperAdminPage } from '../hooks/useSuperAdminPage'

function formatTaskDate(iso: string | undefined): string {
  if (!iso) return '—'
  return iso
}

export function SuperAdmin() {
  const { user } = useAuth()
  const {
    users,
    usersLoading,
    usersError,
    reloadUsers,
    expandedUserId,
    toggleUserExpanded,
    userTasks,
    loadMoreTasks,
    statusBusyId,
    actionError,
    setUserStatus,
  } = useSuperAdminPage(user?.id)

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 pb-4 xl:gap-6">
      <header className="animate-fade-up min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-tight text-white">
            Super Admin
          </h1>
          <Shield className="h-5 w-5 text-primary-cyan" strokeWidth={2} aria-hidden />
        </div>
        <p className="mt-2 max-w-xl text-[15px] text-text-secondary">
          Manage user accounts and review task activity across TaskFlow.
        </p>
      </header>

      {actionError ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {actionError}
        </p>
      ) : null}

      {usersLoading ? (
        <GlassCard tier="secondary" className="px-6 py-14 text-center text-sm text-text-secondary">
          Loading users…
        </GlassCard>
      ) : usersError ? (
        <AnalyticsTasksErrorState
          title="Couldn't load users"
          message={usersError}
          onRetry={() => void reloadUsers()}
        />
      ) : users.length === 0 ? (
        <GlassCard tier="secondary" className="px-6 py-14 text-center text-sm text-text-secondary">
          No users found.
        </GlassCard>
      ) : (
        <ul className="flex flex-col gap-3">
          {users.map((u) => {
            const expanded = expandedUserId === u.id
            const tasksState = userTasks[u.id]
            const isSelf = user?.id === String(u.id)
            const isSuperAdminUser = u.role === 'SUPER_ADMIN'
            const statusBusy = statusBusyId === u.id

            return (
              <li key={u.id}>
                <GlassCard tier="main" className="overflow-hidden p-0">
                  <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-start gap-2 text-left"
                      onClick={() => toggleUserExpanded(u.id)}
                      aria-expanded={expanded}
                    >
                      {expanded ? (
                        <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                      ) : (
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                      )}
                      <span className="min-w-0">
                        <span className="block font-semibold text-text-main">{u.name}</span>
                        <span className="block text-sm text-text-secondary">{u.email}</span>
                      </span>
                    </button>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={[
                          'rounded-lg border px-2 py-1 font-medium uppercase tracking-wide',
                          u.status === 'ACTIVE'
                            ? 'border-success/30 bg-success/10 text-success'
                            : 'border-danger/30 bg-danger/10 text-danger',
                        ].join(' ')}
                      >
                        {u.status}
                      </span>
                      <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-text-muted">
                        {u.taskCount} tasks
                      </span>
                    </div>
                    {!isSelf && !isSuperAdminUser ? (
                      <div className="flex flex-wrap gap-2">
                        {u.status === 'ACTIVE' ? (
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={statusBusy}
                            onClick={() => void setUserStatus(u.id, 'BLOCKED')}
                          >
                            Block
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            disabled={statusBusy}
                            onClick={() => void setUserStatus(u.id, 'ACTIVE')}
                          >
                            Unblock
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {expanded ? (
                    <div className="border-t border-white/10 bg-white/[0.02] px-4 py-4 sm:px-5">
                      {tasksState?.loading ? (
                        <p className="text-sm text-text-muted">Loading tasks…</p>
                      ) : tasksState?.error ? (
                        <p className="text-sm text-danger">{tasksState.error}</p>
                      ) : !tasksState?.tasks.length ? (
                        <p className="text-sm text-text-muted">No tasks for this user.</p>
                      ) : (
                        <ul className="space-y-2">
                          {tasksState.tasks.map((task) => (
                            <li
                              key={task.id}
                              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <span className="font-medium text-text-main">{task.title}</span>
                                <span className="text-xs uppercase text-text-muted">
                                  {task.status ?? 'PENDING'}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-text-secondary">
                                {formatTaskDate(task.taskDate)} ·{' '}
                                {task.priority ? task.priority.toLowerCase() : '—'} priority
                                {task.plannedDuration != null
                                  ? ` · ${task.plannedDuration} min planned`
                                  : ''}
                                {task.actualDuration != null
                                  ? ` · ${task.actualDuration} min worked`
                                  : ''}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                      {tasksState?.hasNext ? (
                        <Button
                          type="button"
                          variant="secondary"
                          className="mt-4"
                          disabled={tasksState.loadingMore}
                          onClick={() => loadMoreTasks(u.id)}
                        >
                          {tasksState.loadingMore ? 'Loading…' : 'Load more'}
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </GlassCard>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
