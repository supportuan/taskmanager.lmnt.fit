import { createInitialTasks } from './initialTasksData'

/** Seed tasks for Task Tracker — shared with Completed page via TaskFlowContext. */
export function createTrackerSeedTasks(referenceDate = new Date()) {
  return createInitialTasks(referenceDate)
}
