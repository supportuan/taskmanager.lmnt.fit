import type {
  AnalyticsCompletionSummary,
  AnalyticsOverview,
  AnalyticsTimeSummary,
  ProductivityInsight,
} from '../../types/analytics'
import { formatMinutesCompact, formatPercent } from './formatting'

export function generateProductivityInsights(input: {
  overview: AnalyticsOverview
  completion: AnalyticsCompletionSummary
  time: AnalyticsTimeSummary
  productivityScore: number | null
  previousCompletionRate: number | null
}): ProductivityInsight[] {
  const insights: ProductivityInsight[] = []
  const { overview, completion, time, productivityScore, previousCompletionRate } = input

  const rate = overview.completionRate
  if (rate != null && rate >= 85) {
    insights.push({
      id: 'strong-completion',
      type: 'performance',
      title: 'Strong completion',
      body: `You've completed ${formatPercent(rate)} of planned tasks in this period. Keep protecting your focus time.`,
      tone: 'positive',
    })
  } else if (rate != null && rate < 60 && overview.tasksPlanned >= 3) {
    insights.push({
      id: 'low-completion',
      type: 'performance',
      title: 'Completion dipped',
      body: 'Your completion rate is below 60%. Consider reducing daily load or rescheduling overflow tasks.',
      tone: 'negative',
    })
  }

  if (
    previousCompletionRate != null &&
    rate != null &&
    rate - previousCompletionRate >= 8
  ) {
    insights.push({
      id: 'rate-improved',
      type: 'improvement',
      title: 'Completion improved',
      body: `Your completion rate improved by ${Math.round(rate - previousCompletionRate)}% compared with the previous period.`,
      tone: 'positive',
    })
  }

  if (time.totalPlannedMinutes > 0 && time.totalActualMinutes > 0) {
    if (time.totalActualMinutes < time.totalPlannedMinutes * 0.92) {
      insights.push({
        id: 'faster-than-planned',
        type: 'planning',
        title: 'Ahead of estimates',
        body: "You're finishing work faster than planned overall. Your estimates may be conservative.",
        tone: 'positive',
      })
    } else if (time.totalActualMinutes > time.totalPlannedMinutes * 1.08) {
      insights.push({
        id: 'slower-than-planned',
        type: 'planning',
        title: 'Add buffer time',
        body: 'Several tasks took longer than planned. Consider adding buffer to similar work.',
        tone: 'negative',
      })
    }
  }

  if (overview.currentStreakDays >= 7) {
    insights.push({
      id: 'streak-7',
      type: 'achievement',
      title: 'Consistency habit',
      body: `You're on a ${overview.currentStreakDays}-day streak. Consistency is becoming a habit.`,
      tone: 'positive',
    })
  } else if (overview.currentStreakDays >= 3) {
    insights.push({
      id: 'streak-3',
      type: 'consistency',
      title: 'Building momentum',
      body: `${overview.currentStreakDays} days in a row with completed work — keep the rhythm going.`,
      tone: 'neutral',
    })
  }

  const topCategory = time.categoryBreakdown[0]
  if (topCategory && time.totalActualMinutes > 0) {
    const share = Math.round((topCategory.actualMinutes / time.totalActualMinutes) * 100)
    if (share >= 40) {
      insights.push({
        id: 'category-dominant',
        type: 'category',
        title: 'Time by category',
        body: `${topCategory.category} tasks account for about ${share}% of your working time this period (${formatMinutesCompact(topCategory.actualMinutes)}).`,
        tone: 'neutral',
      })
    }
  }

  if (completion.bestDay && completion.bestDay.completedTasks >= 2) {
    insights.push({
      id: 'best-day',
      type: 'consistency',
      title: 'Strongest day',
      body: `${completion.bestDay.label} was your strongest day with ${completion.bestDay.completedTasks} tasks completed (${formatPercent(completion.bestDay.completionRate)} rate).`,
      tone: 'positive',
    })
  }

  if (productivityScore != null && productivityScore >= 80) {
    insights.push({
      id: 'score-high',
      type: 'achievement',
      title: 'Solid productivity',
      body: `Your productivity score is ${productivityScore}/100 for this period across completion, efficiency, and consistency.`,
      tone: 'positive',
    })
  }

  const seen = new Set<string>()
  const unique: ProductivityInsight[] = []
  for (const item of insights) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    unique.push(item)
    if (unique.length >= 5) break
  }
  return unique
}
