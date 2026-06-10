import type { ScorePoint } from '@/types/analytics'

type Props = {
  points: ScorePoint[]
}

const WIDTH = 640
const HEIGHT = 220
const PADDING = { top: 16, right: 16, bottom: 32, left: 40 }

export default function ScoreOverTimeChart({ points }: Props) {
  if (points.length === 0) {
    return (
      <div className="border-border bg-background text-muted-foreground rounded-lg border p-8 text-center text-sm">
        No quiz attempts yet — your score over time will appear here.
      </div>
    )
  }

  const innerW = WIDTH - PADDING.left - PADDING.right
  const innerH = HEIGHT - PADDING.top - PADDING.bottom

  const xFor = (i: number) =>
    PADDING.left + (points.length === 1 ? innerW / 2 : (i * innerW) / (points.length - 1))
  const yFor = (score: number) => PADDING.top + innerH - (score / 100) * innerH

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.score)}`).join(' ')

  const yTicks = [0, 25, 50, 75, 100]

  return (
    <div className="border-border bg-background rounded-lg border p-4">
      <h3 className="mb-3 text-sm font-semibold">Score over time</h3>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Line chart of quiz scores over time"
      >
        {yTicks.map((tick) => {
          const y = yFor(tick)
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <text
                x={PADDING.left - 6}
                y={y}
                textAnchor="end"
                dominantBaseline="central"
                className="fill-muted-foreground text-[10px]"
              >
                {tick}%
              </text>
            </g>
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

        {points.map((p, i) => {
          if (points.length > 8 && i % Math.ceil(points.length / 8) !== 0) return null
          return (
            <text
              key={`${p.date}-${i}`}
              x={xFor(i)}
              y={HEIGHT - PADDING.bottom + 14}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {formatDateLabel(p.date)}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

function formatDateLabel(iso: string) {
  const datePart = iso.split('T')[0]
  const [, month, day] = datePart.split('-')
  if (!month || !day) return iso
  return `${month}/${day}`
}
