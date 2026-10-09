export type AnalyticsRangePreset = 'today' | '7d' | '30d' | 'month' | 'custom'

export interface AnalyticsFilterState {
  range: AnalyticsRangePreset
  startDate: string
  endDate: string
}

export interface DateRangeBounds {
  start: Date
  end: Date
  startIso: string
  endIso: string
}

export type TrendTone = 'positive' | 'negative' | 'neutral'

export interface MetricTrend {
  label: string
  tone: TrendTone
}

export interface DailyCompletionPoint {
  date: string
  label: string
  plannedTasks: number
  completedTasks: number
  completionRate: number
}

export interface DailyTimePoint {
  date: string
  label: string
  plannedMinutes: number
  actualMinutes: number
}

export interface CategoryTimePoint {
  category: string
  actualMinutes: number
}

export interface AnalyticsOverview {
  completionRate: number | null
  tasksCompleted: number
  tasksPlanned: number
  timeWorkedMinutes: number
  averageTaskMinutes: number | null
  currentStreakDays: number
  trends: {
    completionRate?: MetricTrend
    tasksCompleted?: MetricTrend
    timeWorked?: MetricTrend
    averageTask?: MetricTrend
  }
}

export interface AnalyticsCompletionSummary {
  daily: DailyCompletionPoint[]
  bestDay: DailyCompletionPoint | null
  lowestDay: DailyCompletionPoint | null
  averageDailyCompletionRate: number | null
  insightLine: string | null
}

export interface AnalyticsTimeSummary {
  daily: DailyTimePoint[]
  totalPlannedMinutes: number
  totalActualMinutes: number
  timeDeltaMinutes: number
  efficiencyLabel: string | null
  categoryBreakdown: CategoryTimePoint[]
  priorityBreakdown: { priority: string; actualMinutes: number }[]
  averageDurationTrend: DailyTimePoint[]
}

export interface ProductivityInsight {
  id: string
  type:
    | 'performance'
    | 'time'
    | 'consistency'
    | 'planning'
    | 'category'
    | 'achievement'
    | 'improvement'
  title: string
  body: string
  tone: TrendTone
}

export interface AnalyticsBundle {
  filter: AnalyticsFilterState
  bounds: DateRangeBounds
  previousBounds: DateRangeBounds | null
  overview: AnalyticsOverview
  completion: AnalyticsCompletionSummary
  time: AnalyticsTimeSummary
  productivityScore: number | null
  insights: ProductivityInsight[]
  hasEnoughData: boolean
  isEmpty: boolean
}
