import type { Task, TaskPriority } from '../../types/task'

const PRIORITY_ORDER: TaskPriority[] = ['low', 'medium', 'high']

function isIncompleteTask(task: Task): boolean {
  return task.status !== 'completed'
}

/** One dot per priority level present among incomplete tasks on that date. */
export function getPriorityIndicatorsForDate(tasks: Task[], dateIso: string): TaskPriority[] {
  const present = new Set<TaskPriority>()
  for (const task of tasks) {
    if (task.date !== dateIso || !isIncompleteTask(task)) continue
    present.add(task.priority)
  }
  return PRIORITY_ORDER.filter((p) => present.has(p))
}

export function buildPriorityIndicatorsByDate(tasks: Task[]): Map<string, TaskPriority[]> {
  const byDate = new Map<string, Set<TaskPriority>>()
  for (const task of tasks) {
    if (!isIncompleteTask(task)) continue
    let set = byDate.get(task.date)
    if (!set) {
      set = new Set()
      byDate.set(task.date, set)
    }
    set.add(task.priority)
  }
  const result = new Map<string, TaskPriority[]>()
  for (const [date, set] of byDate) {
    result.set(date, PRIORITY_ORDER.filter((p) => set.has(p)))
  }
  return result
}

export const CALENDAR_PRIORITY_DOT_CLASS: Record<TaskPriority, string> = {
  low: 'calendar-priority-dot calendar-priority-dot-low',
  medium: 'calendar-priority-dot calendar-priority-dot-medium',
  high: 'calendar-priority-dot calendar-priority-dot-high',
}
