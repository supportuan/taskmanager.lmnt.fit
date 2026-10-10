import { X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { navItems, superAdminNavItem } from '../../config/navigation'
import { useAuth } from '../../context/AuthContext'
import { isBackendAuthEnabled } from '../../services/auth/authConfig'
import { isSuperAdmin } from '../../utils/authRoles'
import { DailyMomentumBlock } from './DailyMomentumBlock'
import { TaskFlowLogo } from './TaskFlowLogo'

interface MobileNavDrawerProps {
  open: boolean
  onClose: () => void
}

export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const { user } = useAuth()

  const items = useMemo(() => {
    if (isBackendAuthEnabled() && isSuperAdmin(user)) {
      return [...navItems, superAdminNavItem]
    }
    return navItems
  }, [user])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <button
        type="button"
        className="absolute inset-0 bg-[#030817]/75 backdrop-blur-sm"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="absolute left-0 top-0 flex h-full w-[min(100%,320px)] min-h-0 flex-col border-r border-white/10 bg-[rgba(8,18,42,0.96)] p-4 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
        <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
          <TaskFlowLogo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="glass-icon-btn flex h-10 w-10 items-center justify-center rounded-full"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <nav
          className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto"
          aria-label="Main navigation"
        >
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-[220ms]',
                  isActive ? 'nav-active' : 'nav-item-inactive text-text-secondary',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={[
                      'h-[18px] w-[18px] shrink-0',
                      isActive ? 'text-primary-cyan' : 'text-text-muted',
                    ].join(' ')}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  <span className={isActive ? 'font-semibold text-white' : ''}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto shrink-0 pt-4">
          <DailyMomentumBlock />
        </div>
      </div>
    </div>
  )
}
