export interface ChartPadding {
  t: number
  r: number
  b: number
  l: number
}

const AXIS_FILL = 'rgba(200,220,255,0.45)'
const TITLE_FILL = 'rgba(200,220,255,0.55)'

export function yAxisTickValues(maxY: number): number[] {
  if (maxY <= 1) return [0, 1]
  const mid = Math.ceil(maxY / 2)
  if (mid === maxY) return [0, maxY]
  return [0, mid, maxY]
}

interface ChartYAxisLabelsProps {
  width: number
  height: number
  pad: ChartPadding
  maxY: number
  formatValue?: (value: number) => string
}

export function ChartYAxisLabels({
  width: _W,
  height: H,
  pad: PAD,
  maxY,
  formatValue = (v) => String(Math.round(v)),
}: ChartYAxisLabelsProps) {
  const innerH = H - PAD.t - PAD.b
  return (
    <>
      {yAxisTickValues(maxY).map((v, idx) => {
        const y = PAD.t + innerH * (1 - v / maxY)
        return (
          <text
            key={idx}
            x={PAD.l - 8}
            y={y + 4}
            textAnchor="end"
            fill={AXIS_FILL}
            fontSize={10}
          >
            {formatValue(v)}
          </text>
        )
      })}
    </>
  )
}

interface ChartAxisTitlesProps {
  width: number
  height: number
  pad: ChartPadding
  xTitle?: string
  yTitle?: string
}

export function ChartAxisTitles({
  width: W,
  height: H,
  pad: PAD,
  xTitle = 'Date',
  yTitle,
}: ChartAxisTitlesProps) {
  const centerY = PAD.t + (H - PAD.t - PAD.b) / 2
  return (
    <>
      {yTitle ? (
        <text
          x={12}
          y={centerY}
          transform={`rotate(-90, 12, ${centerY})`}
          textAnchor="middle"
          fill={TITLE_FILL}
          fontSize={10}
          fontWeight={500}
        >
          {yTitle}
        </text>
      ) : null}
      <text
        x={PAD.l + (W - PAD.l - PAD.r) / 2}
        y={H - 4}
        textAnchor="middle"
        fill={TITLE_FILL}
        fontSize={10}
        fontWeight={500}
      >
        {xTitle}
      </text>
    </>
  )
}

export function formatYAxisMinutes(minutes: number): string {
  const m = Math.round(minutes)
  if (m <= 0) return '0'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`
}
