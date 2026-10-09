import type { ReactNode } from 'react'

interface AnalyticsChartFrameProps {
  children: ReactNode
  ariaLabel: string
  summary: string
  height?: number
}

export function AnalyticsChartFrame({
  children,
  ariaLabel,
  summary,
  height = 220,
}: AnalyticsChartFrameProps) {
  return (
    <div className="relative w-full min-w-0" role="img" aria-label={ariaLabel}>
      <p className="sr-only">{summary}</p>
      <svg
        viewBox={`0 0 640 ${height}`}
        className="h-auto w-full max-w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {children}
      </svg>
    </div>
  )
}
