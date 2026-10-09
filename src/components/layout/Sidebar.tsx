import { ChevronLeft, Sprout } from 'lucide-react'
import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { MOUNTAIN_BACKGROUND_URL } from '../../config/background'
import { navItems, superAdminNavItem } from '../../config/navigation'
import { useAuth } from '../../context/AuthContext'
import { useTaskFlow } from '../../context/TaskFlowContext'
import { isBackendAuthEnabled } from '../../services/auth/authConfig'
import { isSuperAdmin } from '../../utils/authRoles'
import { formatISODate } from '../../utils/dateUtils'
import { tasksForDate } from '../../utils/trackerUtils'
import { ProgressBar } from '../common/ProgressBar'
import { TaskFlowLogo } from './TaskFlowLogo'

function todayCompletionPercent(tasks: ReturnType<typeof useTaskFlow>['tasks']): number {
  const todayIso = formatISODate(new Date())
  const todayTasks = tasksForDate(tasks, todayIso)
  if (todayTasks.length === 0) return 0
  const completed = todayTasks.filter((t) => t.workflowStatus === 'completed').length
  return Math.min(100, Math.max(0, Math.round((completed / todayTasks.length) * 100)))
}

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

const collapseToggleClass =
  'glass-icon-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full'

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { user } = useAuth()
  const { tasks } = useTaskFlow()
  const momentumPercent = useMemo(() => todayCompletionPercent(tasks), [tasks])
  const sidebarNavItems = useMemo(() => {
    if (isBackendAuthEnabled() && isSuperAdmin(user)) {
      return [...navItems, superAdminNavItem]
    }
    return navItems
  }, [user])

  return (
    <aside
      className={[
        'fixed left-4 top-4 z-20 flex h-[calc(100vh-2rem)] shrink-0 flex-col overflow-hidden rounded-glass glass-panel-sidebar',
        collapsed ? 'w-[88px] px-2' : 'w-[268px] px-5',
      ].join(' ')}
    >
      {/* Same landscape — cropped to sidebar lower area (reference composition) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[12%] rounded-b-[20px]"
        style={{
          backgroundImage: `url(${MOUNTAIN_BACKGROUND_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: collapsed ? '22% 72%' : '18% 68%',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[10%] rounded-b-[20px]"
        style={{
          background: `
            linear-gradient(180deg,
              rgba(7, 17, 40, 0.88) 0%,
              rgba(7, 17, 40, 0.45) 22%,
              rgba(7, 17, 40, 0.12) 48%,
              transparent 72%
            )
          `,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div
          className={
            collapsed
              ? 'flex flex-col items-center gap-3 pt-6'
              : 'flex items-center justify-between gap-2 pt-6'
          }
        >
          {collapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
            >
              <TaskFlowLogo compact />
            </button>
          ) : (
            <>
              <TaskFlowLogo />
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                className={collapseToggleClass}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              </button>
            </>
          )}
        </div>

        <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <nav
          className={[
            'flex flex-1 flex-col gap-1.5',
            collapsed ? 'items-center' : '',
          ].join(' ')}
          aria-label="Main navigation"
        >
          {sidebarNavItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                [
                  'group flex items-center text-sm font-medium transition-all duration-[220ms] ease-out',
                  collapsed
                    ? 'h-10 w-10 shrink-0 justify-center rounded-xl p-0'
                    : 'gap-3 rounded-xl px-3 py-3',
                  isActive ? 'nav-active' : 'nav-item-inactive text-text-secondary',
                  !collapsed && !isActive && 'hover:translate-x-0.5',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={[
                      'nav-item-icon h-[18px] w-[18px] shrink-0',
                      isActive ? 'text-primary-cyan' : 'text-text-muted',
                    ].join(' ')}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  {!collapsed && (
                    <span className={isActive ? 'font-semibold text-white' : ''}>{label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {!collapsed && (
          <div className="relative z-[1] -mt-[5px] mb-4 shrink-0">
            <div className="sidebar-momentum-card rounded-2xl border border-white/12 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-success">
                  <Sprout className="h-4 w-4" strokeWidth={2} />
                  <span className="text-xs font-medium text-text-secondary">Daily momentum</span>
                </div>
                <span className="text-xs font-medium tabular-nums text-text-muted">
                  {momentumPercent}%
                </span>
              </div>
              <p className="text-sm leading-snug text-text-main">
                Small steps.
                <br />
                <span className="text-text-secondary">Create big results.</span>
              </p>
              <ProgressBar value={momentumPercent} className="mt-3" />
            </div>
            <a
              href="https://www.auntechconsulting.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-center text-[10px] leading-snug text-text-muted transition-colors hover:text-primary-cyan sm:text-[11px]"
            >
              D&amp;D © 2026 AUNtech V1.1
            </a>
          </div>
        )}
      </div>
    </aside>
  )
}
