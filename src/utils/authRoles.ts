import type { AuthUser } from '../types/auth'

export function isSuperAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === 'SUPER_ADMIN'
}
