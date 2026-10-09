import { useMemo, useState } from 'react'
import type { DailyTimePoint } from '../../../types/analytics'
import { axisLabelForPoint } from '../../../utils/analytics/chartAxisTicks'
import { formatMinutesCompact } from '../../../utils/analytics/formatting'
import { AnalyticsChartFrame } from './AnalyticsChartFrame'
import { ChartAxisTitles, ChartYAxisLabels, formatYAxisMinutes } from './ChartAxes'

interface TimeWorkedChartProps {
  data: DailyTimePoint[]
}

const W = 640
const H = 200
const PAD = { t: 28, r: 16, b: 44, l: 48 }

export function TimeWorkedChart({ data }: TimeWorkedChartProps) {
  const [hover, setHover] = useState<number | null>(null)

  const { points, maxY, summary } = useMemo(() => {
    const maxYVal = Math.max(1, ...data.map((d) => d.actualMinutes))
    const innerW = W - PAD.l - PAD.r
    const innerH = H - PAD.t - PAD.b
    const pts = data.map((d, i) => {
      const x = PAD.l + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
      const y = PAD.t + innerH - (d.actualMinutes / maxYVal) * innerH
      return { ...d, x, y, i }
    })
    return {
      points: pts,
      maxY: maxYVal,
      summary: 'Minutes worked per day in the selected range.',
    }
  }, [data])

  if (data.every((d) => d.actualMinutes === 0)) {
    return (
      <p className="py-8 text-center text-sm text-text-muted">Not enough time data yet.</p>
    )
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const active = hover != null ? points[hover] : null

  return (
    <div className="relative">
      <AnalyticsChartFrame ariaLabel="Time worked per day" summary={summary} height={H}>
        <defs>
          <linearGradient id="timeLineGrad" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#25C8FF" />
            <stop offset="100%" stopColor="#208CFF" />
          </linearGradient>
        </defs>
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
        <ChartYAxisLabels
          width={W}
          height={H}
          pad={PAD}
          maxY={maxY}
          formatValue={formatYAxisMinutes}
        />
        <ChartAxisTitles
          width={W}
          height={H}
          pad={PAD}
          xTitle="Date"
          yTitle="Time worked"
        />
        <path
          d={linePath}
          fill="none"
          stroke="url(#timeLineGrad)"
          strokeWidth={2.5}
          strokeLinecap="round"
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
                r={hover === p.i ? 5 : 3.5}
                fill="#25C8FF"
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
          className="pointer-events-none absolute z-10 rounded-xl border border-white/15 bg-[rgba(8,18,42,0.88)] px-3 py-2 text-xs backdrop-blur-xl"
          style={{ left: `${(active.x / W) * 100}%`, top: '6%', transform: 'translateX(-50%)' }}
        >
          <p className="font-medium text-text-main">{active.label || active.date}</p>
          <p className="text-text-muted">Time: {formatMinutesCompact(active.actualMinutes)}</p>
          <p className="text-text-muted">Planned: {formatMinutesCompact(active.plannedMinutes)}</p>
        </div>
      ) : null}
    </div>
  )
}
