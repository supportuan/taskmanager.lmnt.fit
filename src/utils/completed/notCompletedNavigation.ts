import { formatISODate } from '../dateUtils'

/** Route after marking a completed task as not completed (local calendar dates). */
export function getNotCompletedDestination(taskDateIso: string): '/tracker' | '/forwarded' {
  const todayIso = formatISODate(new Date())
  if (taskDateIso < todayIso) {
    return '/forwarded'
  }
  return '/tracker'
}
