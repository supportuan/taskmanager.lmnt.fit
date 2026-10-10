import { ChevronLeft } from 'lucide-react'
import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { MOUNTAIN_BACKGROUND_URL } from '../../config/background'
import { navItems, superAdminNavItem } from '../../config/navigation'
import { useAuth } from '../../context/AuthContext'
import { isBackendAuthEnabled } from '../../services/auth/authConfig'
import { isSuperAdmin } from '../../utils/authRoles'
import { DailyMomentumBlock } from './DailyMomentumBlock'
import { TaskFlowLogo } from './TaskFlowLogo'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

const collapseToggleClass =
  'glass-icon-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full'

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { user } = useAuth()
  const sidebarNavItems = useMemo(() => {
    if (isBackendAuthEnabled() && isSuperAdmin(user)) {
      return [...navItems, superAdminNavItem]
    }
    return navItems
  }, [user])

  return (
    <aside
      className={[
        'fixed left-4 top-4 z-20 hidden h-[calc(100vh-2rem)] shrink-0 flex-col overflow-hidden rounded-glass glass-panel-sidebar lg:flex',
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

        {!collapsed ? <DailyMomentumBlock className="mb-4" /> : null}
      </div>
    </aside>
  )
}
