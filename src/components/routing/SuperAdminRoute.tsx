import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isBackendAuthEnabled } from '../../services/auth/authConfig'
import { isSuperAdmin } from '../../utils/authRoles'

export function SuperAdminRoute() {
  const { user, isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <div className="relative flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated || !isBackendAuthEnabled() || !isSuperAdmin(user)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
