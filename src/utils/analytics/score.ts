export function calculateProductivityScore(input: {
  completionRate: number | null
  plannedMinutes: number
  actualMinutes: number
  completionDays: number
  totalDays: number
}): number | null {
  const { completionRate, plannedMinutes, actualMinutes, completionDays, totalDays } = input
  if (completionRate == null && actualMinutes <= 0) return null

  const completionScore = completionRate != null ? Math.min(100, Math.max(0, completionRate)) : 0

  let efficiencyScore = 50
  if (plannedMinutes > 0 && actualMinutes > 0) {
    if (actualMinutes <= plannedMinutes) {
      efficiencyScore = 100
    } else {
      const overrun = (actualMinutes - plannedMinutes) / plannedMinutes
      efficiencyScore = Math.max(0, 100 - overrun * 100)
    }
  } else if (actualMinutes > 0) {
    efficiencyScore = 75
  }

  let consistencyScore = 0
  if (totalDays > 0) {
    consistencyScore = Math.min(100, (completionDays / totalDays) * 100)
  }

  const hasData = completionScore > 0 || actualMinutes > 0 || completionDays > 0
  if (!hasData) return null

  const score =
    completionScore * 0.4 + efficiencyScore * 0.3 + consistencyScore * 0.3
  if (!Number.isFinite(score)) return null
  return Math.min(100, Math.max(0, Math.round(score)))
}
