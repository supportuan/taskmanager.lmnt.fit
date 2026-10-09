import { useMemo, useState } from 'react'
import type { DailyCompletionPoint } from '../../../types/analytics'
import { axisLabelForPoint } from '../../../utils/analytics/chartAxisTicks'
import { AnalyticsChartFrame } from './AnalyticsChartFrame'
import { ChartAxisTitles, ChartYAxisLabels } from './ChartAxes'

interface PlannedVsCompletedChartProps {
  data: DailyCompletionPoint[]
}

const W = 640
const H = 220
const PAD = { t: 28, r: 16, b: 44, l: 44 }

export function PlannedVsCompletedChart({ data }: PlannedVsCompletedChartProps) {
  const [hover, setHover] = useState<number | null>(null)

  const { bars, maxY, summary } = useMemo(() => {
    const maxYVal = Math.max(
      1,
      ...data.flatMap((d) => [d.plannedTasks, d.completedTasks]),
    )
    const innerW = W - PAD.l - PAD.r
    const innerH = H - PAD.t - PAD.b
    const groupW = innerW / Math.max(1, data.length)
    const items = data.map((d, i) => {
      const cx = PAD.l + groupW * i + groupW / 2
      const plannedH = (d.plannedTasks / maxYVal) * innerH
      const completedH = (d.completedTasks / maxYVal) * innerH
      return { ...d, cx, plannedH, completedH, i, groupW }
    })
    return {
      bars: items,
      maxY: maxYVal,
      summary: 'Planned versus completed tasks per day.',
    }
  }, [data])

  if (data.every((d) => d.plannedTasks === 0 && d.completedTasks === 0)) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">Not enough data for this chart.</p>
    )
  }

  const active = hover != null ? bars[hover] : null
  const baseY = H - PAD.b

  return (
    <div className="relative">
      <AnalyticsChartFrame
        ariaLabel="Planned versus completed tasks"
        summary={summary}
        height={H}
      >
        {[0, 0.5, 1].map((f) => {
          const y = PAD.t + (H - PAD.t - PAD.b) * f
          return (
            <line
              key={f}
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y}
              y2={y}
              stroke="rgba(130,185,255,0.08)"
            />
          )
        })}
        <ChartYAxisLabels width={W} height={H} pad={PAD} maxY={maxY} />
        <ChartAxisTitles
          width={W}
          height={H}
          pad={PAD}
          xTitle="Date"
          yTitle="Tasks"
        />
        {bars.map((b) => {
          const axisLabel = axisLabelForPoint(b.i, bars.length, b.date, b.label)
          return (
          <g key={b.date}>
            {axisLabel ? (
              <text
                x={b.cx}
                y={H - 18}
                textAnchor="middle"
                fill="rgba(200,220,255,0.5)"
                fontSize={10}
              >
                {axisLabel}
              </text>
            ) : null}
            <rect
              x={b.cx - 10}
              y={baseY - b.plannedH}
              width={10}
              height={b.plannedH}
              rx={3}
              fill="rgba(123,77,255,0.55)"
              onMouseEnter={() => setHover(b.i)}
              onMouseLeave={() => setHover(null)}
            />
            <rect
              x={b.cx + 2}
              y={baseY - b.completedH}
              width={10}
              height={b.completedH}
              rx={3}
              fill="rgba(37,200,255,0.75)"
              onMouseEnter={() => setHover(b.i)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
          )
        })}
        <text x={PAD.l + 52} y={16} fill="rgba(200,220,255,0.55)" fontSize={10}>
          Planned
        </text>
        <rect x={PAD.l + 96} y={8} width={10} height={10} rx={2} fill="rgba(123,77,255,0.55)" />
        <text x={PAD.l + 112} y={16} fill="rgba(200,220,255,0.55)" fontSize={10}>
          Completed
        </text>
        <rect x={PAD.l + 172} y={8} width={10} height={10} rx={2} fill="rgba(37,200,255,0.75)" />
      </AnalyticsChartFrame>
      {active ? (
        <div
          className="pointer-events-none absolute z-10 rounded-xl border border-white/15 bg-[rgba(8,18,42,0.88)] px-3 py-2 text-xs backdrop-blur-xl"
          style={{
            left: `${(active.cx / W) * 100}%`,
            top: '8%',
            transform: 'translateX(-50%)',
          }}
        >
          <p className="font-medium text-text-main">{active.label || active.date}</p>
          <p className="text-text-muted">Planned: {active.plannedTasks}</p>
          <p className="text-text-muted">Completed: {active.completedTasks}</p>
        </div>
      ) : null}
    </div>
  )
}
