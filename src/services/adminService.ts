import { apiFetch } from './api'
import type { UserAccountStatus, UserRole } from '../types/auth'
import type { TaskApiRecord } from './taskService'

export interface AdminUserSummary {
  id: number
  name: string
  email: string
  role: UserRole
  status: UserAccountStatus
  taskCount: number
}

export interface AdminTaskPage {
  content: TaskApiRecord[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

export function listAdminUsers(): Promise<AdminUserSummary[]> {
  return apiFetch<AdminUserSummary[]>('/api/admin/users')
}

export function listAdminUserTasks(
  userId: number,
  page: number,
  size = 10,
): Promise<AdminTaskPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  })
  return apiFetch<AdminTaskPage>(`/api/admin/users/${userId}/tasks?${params.toString()}`)
}

export function updateAdminUserStatus(
  userId: number,
  status: UserAccountStatus,
): Promise<AdminUserSummary> {
  return apiFetch<AdminUserSummary>(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
