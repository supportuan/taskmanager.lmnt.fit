import { useMemo, useState } from 'react'
import type { DailyCompletionPoint } from '../../../types/analytics'
import { axisLabelForPoint } from '../../../utils/analytics/chartAxisTicks'
import { AnalyticsChartFrame } from './AnalyticsChartFrame'
import { ChartAxisTitles } from './ChartAxes'

interface CompletionTrendChartProps {
  data: DailyCompletionPoint[]
}

const W = 640
const H = 220
const PAD = { t: 16, r: 16, b: 44, l: 44 }

export function CompletionTrendChart({ data }: CompletionTrendChartProps) {
  const [hover, setHover] = useState<number | null>(null)

  const { points, maxY, summary } = useMemo(() => {
    const maxYVal = Math.max(1, ...data.map((d) => d.completedTasks))
    const innerW = W - PAD.l - PAD.r
    const innerH = H - PAD.t - PAD.b
    const pts = data.map((d, i) => {
      const x = PAD.l + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
      const y = PAD.t + innerH - (d.completedTasks / maxYVal) * innerH
      return { ...d, x, y, i }
    })
    const total = data.reduce((s, d) => s + d.completedTasks, 0)
    return {
      points: pts,
      maxY: maxYVal,
      summary: `Completion trend: ${total} tasks completed across ${data.length} days.`,
    }
  }, [data])

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">Not enough data for this chart.</p>
    )
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H - PAD.b} L ${points[0].x} ${H - PAD.b} Z`

  const active = hover != null ? points[hover] : null

  return (
    <div className="relative">
      <AnalyticsChartFrame ariaLabel="Completed tasks over time" summary={summary} height={H}>
        <defs>
          <linearGradient id="completionLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#208CFF" />
            <stop offset="50%" stopColor="#25C8FF" />
            <stop offset="100%" stopColor="#7B4DFF" />
          </linearGradient>
          <linearGradient id="completionAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(37,200,255,0.28)" />
            <stop offset="100%" stopColor="rgba(37,200,255,0)" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = PAD.t + (H - PAD.t - PAD.b) * f
          return (
            <line
              key={f}
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y}
              y2={y}
              stroke="rgba(130,185,255,0.08)"
              strokeWidth={1}
            />
          )
        })}
        {[0, Math.ceil(maxY / 2), maxY].map((v, idx) => {
          const y = PAD.t + (H - PAD.t - PAD.b) * (1 - v / maxY)
          return (
            <text
              key={idx}
              x={PAD.l - 8}
              y={y + 4}
              textAnchor="end"
              fill="rgba(200,220,255,0.45)"
              fontSize={10}
            >
              {v}
            </text>
          )
        })}
        <ChartAxisTitles
          width={W}
          height={H}
          pad={PAD}
          xTitle="Date"
          yTitle="Tasks completed"
        />
        <path d={areaPath} fill="url(#completionAreaGrad)" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#completionLineGrad)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p) => {
          const axisLabel = axisLabelForPoint(p.i, points.length, p.date, p.label)
          return (
          <g key={p.date}>
            {axisLabel ? (
              <text
                x={p.x}
                y={H - 18}
                textAnchor="middle"
                fill="rgba(200,220,255,0.5)"
                fontSize={10}
              >
                {axisLabel}
              </text>
            ) : null}
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === p.i ? 6 : 4}
              fill={hover === p.i ? '#25C8FF' : '#208CFF'}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={1}
              onMouseEnter={() => setHover(p.i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}
            />
          </g>
          )
        })}
      </AnalyticsChartFrame>
      {active ? (
        <div
          className="pointer-events-none absolute z-10 max-w-[200px] rounded-xl border border-white/15 bg-[rgba(8,18,42,0.88)] px-3 py-2 text-xs shadow-lg backdrop-blur-xl"
          style={{
            left: `${(active.x / W) * 100}%`,
            top: `${(active.y / H) * 100}%`,
            transform: 'translate(-50%, -120%)',
          }}
        >
          <p className="font-medium text-text-main">{active.label || active.date}</p>
          <p className="text-text-muted">Completed: {active.completedTasks}</p>
          <p className="text-text-muted">Planned: {active.plannedTasks}</p>
          <p className="text-text-muted">Rate: {Math.round(active.completionRate)}%</p>
        </div>
      ) : null}
    </div>
  )
}
