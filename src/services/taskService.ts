import { apiFetch } from './api'

export interface TaskApiRecord {
  id: number
  title: string
  description: string | null
  taskDate: string
  startTime: string | null
  endTime: string | null
  plannedDuration: number | null
  actualDuration: number | null
  priority: string | null
  category: string | null
  status: string | null
  progress: number | null
  startedAt: string | null
  completedAt: string | null
  pauseReason: string | null
  scheduledResumeAt: string | null
  completionSummary: string | null
  achievement: string | null
  reflectionNote: string | null
  createdAt: string
  updatedAt: string
  tags?: string[]
  reminder?: string | null
  recurrence?: string | null
}

export interface CreateTaskPayload {
  title: string
  description?: string
  taskDate: string
  startTime?: string
  endTime?: string
  plannedDuration?: number
  priority?: string
  category?: string
  status?: string
  progress?: number
  tags?: string[]
  reminder?: string | null
  recurrence?: string | null
}

export type UpdateTaskPayload = {
  title: string
  description?: string
  taskDate: string
  startTime?: string
  endTime?: string
  plannedDuration: number
  priority?: string
  category?: string
  status?: string
  progress: number
  actualDuration?: number | null
  startedAt?: string | null
  pauseReason?: string | null
  scheduledResumeAt?: string | null
  completionSummary?: string | null
  achievement?: string | null
  reflectionNote?: string | null
  tags?: string[]
  reminder?: string | null
  recurrence?: string | null
}

export function createTask(payload: CreateTaskPayload): Promise<TaskApiRecord> {
  return apiFetch<TaskApiRecord>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getTasks(): Promise<TaskApiRecord[]> {
  return apiFetch<TaskApiRecord[]>('/api/tasks')
}

export function getTaskById(id: number): Promise<TaskApiRecord> {
  return apiFetch<TaskApiRecord>(`/api/tasks/${id}`)
}

export function updateTask(id: number, payload: UpdateTaskPayload): Promise<TaskApiRecord> {
  return apiFetch<TaskApiRecord>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteTask(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/tasks/${id}`, {
    method: 'DELETE',
  })
}
