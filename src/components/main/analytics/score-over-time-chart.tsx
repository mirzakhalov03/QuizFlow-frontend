import type { ScorePoint } from '@/types/analytics'

type Props = {
  points: ScorePoint[]
}

const MIN_CHART_WIDTH = 600
const PX_PER_POINT = 56
const HEIGHT = 220
const AXIS_WIDTH = 40
const PADDING = { top: 16, right: 16, bottom: 32, left: 8 }

export default function ScoreOverTimeChart({ points }: Props) {
  if (points.length === 0) {
    return (
      <div className="border-border bg-background text-muted-foreground rounded-lg border p-8 text-center text-sm">
        No quiz attempts yet — your score over time will appear here.
      </div>
    )
  }

  // The chart SVG grows with point count so labels never crowd; minimum width
  // keeps short series from looking sparse. The wrapper around it scrolls
  // horizontally on mobile while the y-axis stays pinned.
  const chartWidth = Math.max(
    MIN_CHART_WIDTH,
    PADDING.left + PADDING.right + points.length * PX_PER_POINT,
  )
  const innerW = chartWidth - PADDING.left - PADDING.right
  const innerH = HEIGHT - PADDING.top - PADDING.bottom

  const xFor = (i: number) =>
    PADDING.left + (points.length === 1 ? innerW / 2 : (i * innerW) / (points.length - 1))
  const yFor = (score: number) => PADDING.top + innerH - (score / 100) * innerH

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.score)}`).join(' ')

  const yTicks = [0, 25, 50, 75, 100]

  return (
    <div className="border-border bg-background rounded-lg border p-4">
      <h3 className="mb-3 text-sm font-semibold">Score over time</h3>
      <div className="flex">
        <svg
          width={AXIS_WIDTH}
          height={HEIGHT}
          className="flex-shrink-0"
          aria-hidden="true"
        >
          {yTicks.map((tick) => (
            <text
              key={tick}
              x={AXIS_WIDTH - 6}
              y={yFor(tick)}
              textAnchor="end"
              dominantBaseline="central"
              className="fill-muted-foreground text-[10px]"
            >
              {tick}%
            </text>
          ))}
        </svg>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${HEIGHT}`}
            width={chartWidth}
            height={HEIGHT}
            className="h-auto max-w-none"
            role="img"
            aria-label="Line chart of quiz scores over time"
          >
            {yTicks.map((tick) => {
              const y = yFor(tick)
              return (
                <line
                  key={tick}
                  x1={0}
                  x2={chartWidth}
                  y1={y}
                  y2={y}
                  className="stroke-border"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              )
            })}

            <path d={path} className="stroke-primary" fill="none" strokeWidth={2} />

            {points.map((p, i) => (
              <circle
                key={`${p.date}-${i}`}
                cx={xFor(i)}
                cy={yFor(p.score)}
                r={3}
                className="fill-primary"
              >
                <title>{`${p.date}: ${p.score}%`}</title>
              </circle>
            ))}

            {points.map((p, i) => (
              <text
                key={`${p.date}-${i}-label`}
                x={xFor(i)}
                y={HEIGHT - PADDING.bottom + 14}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {formatDateLabel(p.date)}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}

function formatDateLabel(iso: string) {
  const datePart = iso.split('T')[0]
  const [, month, day] = datePart.split('-')
  if (!month || !day) return iso
  return `${month}/${day}`
}
