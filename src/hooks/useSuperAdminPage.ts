import { useCallback, useEffect, useState } from 'react'
import {
  listAdminUserTasks,
  listAdminUsers,
  updateAdminUserStatus,
  type AdminUserSummary,
} from '../services/adminService'
import type { TaskApiRecord } from '../services/taskService'
import { ApiError } from '../services/api'
import type { UserAccountStatus } from '../types/auth'

const TASK_PAGE_SIZE = 10

interface UserTasksState {
  tasks: TaskApiRecord[]
  page: number
  hasNext: boolean
  loading: boolean
  loadingMore: boolean
  error: string | null
}

export function useSuperAdminPage(currentUserId: string | undefined) {
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null)
  const [userTasks, setUserTasks] = useState<Record<number, UserTasksState>>({})
  const [statusBusyId, setStatusBusyId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const list = await listAdminUsers()
      setUsers(list)
    } catch (err) {
      setUsersError(
        err instanceof ApiError ? err.message : 'Unable to load users. Please try again.',
      )
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const fetchUserTasksPage = useCallback(async (userId: number, page: number, append: boolean) => {
    setUserTasks((prev) => ({
      ...prev,
      [userId]: {
        tasks: append ? (prev[userId]?.tasks ?? []) : [],
        page: append ? (prev[userId]?.page ?? -1) : -1,
        hasNext: prev[userId]?.hasNext ?? false,
        loading: !append,
        loadingMore: append,
        error: null,
      },
    }))

    try {
      const result = await listAdminUserTasks(userId, page, TASK_PAGE_SIZE)
      setUserTasks((prev) => ({
        ...prev,
        [userId]: {
          tasks: append ? [...(prev[userId]?.tasks ?? []), ...result.content] : result.content,
          page: result.page,
          hasNext: result.hasNext,
          loading: false,
          loadingMore: false,
          error: null,
        },
      }))
    } catch (err) {
      setUserTasks((prev) => ({
        ...prev,
        [userId]: {
          ...(prev[userId] ?? {
            tasks: [],
            page: 0,
            hasNext: false,
            loading: false,
            loadingMore: false,
          }),
          loading: false,
          loadingMore: false,
          error:
            err instanceof ApiError ? err.message : 'Unable to load tasks. Please try again.',
        },
      }))
    }
  }, [])

  const toggleUserExpanded = useCallback(
    (userId: number) => {
      setExpandedUserId((current) => {
        const next = current === userId ? null : userId
        if (next != null && !userTasks[userId]?.tasks.length && !userTasks[userId]?.loading) {
          void fetchUserTasksPage(userId, 0, false)
        }
        return next
      })
    },
    [fetchUserTasksPage, userTasks],
  )

  const loadMoreTasks = useCallback(
    (userId: number) => {
      const state = userTasks[userId]
      if (!state || state.loadingMore || !state.hasNext) return
      void fetchUserTasksPage(userId, state.page + 1, true)
    },
    [fetchUserTasksPage, userTasks],
  )

  const setUserStatus = useCallback(
    async (userId: number, status: UserAccountStatus) => {
      if (currentUserId != null && String(userId) === currentUserId) return
      setStatusBusyId(userId)
      setActionError(null)
      try {
        const updated = await updateAdminUserStatus(userId, status)
        setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
      } catch (err) {
        setActionError(
          err instanceof ApiError ? err.message : 'Unable to update user status. Please try again.',
        )
      } finally {
        setStatusBusyId(null)
      }
    },
    [currentUserId],
  )

  return {
    users,
    usersLoading,
    usersError,
    reloadUsers: loadUsers,
    expandedUserId,
    toggleUserExpanded,
    userTasks,
    loadMoreTasks,
    statusBusyId,
    actionError,
    setUserStatus,
  }
}
