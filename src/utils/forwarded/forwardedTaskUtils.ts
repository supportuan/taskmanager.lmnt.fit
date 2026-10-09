import type { Task, TaskStatus } from '../../types/task'
import { formatISODate, parseTimeOnDate } from '../dateUtils'

export function getTodayIso(): string {
  return formatISODate(new Date())
}

/** Calendar date is strictly before today (local), and task is not completed. */
export function isForwardedTask(task: Task, todayIso: string = getTodayIso()): boolean {
  if (task.status === 'completed') return false
  return task.date < todayIso
}

export function getForwardedTasks(tasks: Task[], todayIso: string = getTodayIso()): Task[] {
  return tasks.filter((t) => isForwardedTask(t, todayIso))
}

export function sortForwardedTasks(tasks: Task[], order: 'asc' | 'desc'): Task[] {
  const sorted = [...tasks].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date < b.date ? -1 : 1
    }
    return (
      parseTimeOnDate(a.date, a.startTime).getTime() -
      parseTimeOnDate(b.date, b.startTime).getTime()
    )
  })
  return order === 'desc' ? sorted.reverse() : sorted
}

export function filterForwardedTasksBySearch(tasks: Task[], query: string): Task[] {
  const q = query.trim().toLowerCase()
  if (!q) return tasks
  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.priority.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.date.includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)),
  )
}

export function forwardedStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'current':
      return 'In Progress'
    case 'in_progress':
      return 'Paused'
    case 'completed':
      return 'Completed'
    default:
      return 'Pending'
  }
}
