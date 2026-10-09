/** Fired after a task is created/updated/deleted via the API so list views can refetch. */
export const TASKFLOW_TASKS_CHANGED_EVENT = 'taskflow:tasks-changed'

export function notifyTasksChanged(): void {
  window.dispatchEvent(new Event(TASKFLOW_TASKS_CHANGED_EVENT))
}
