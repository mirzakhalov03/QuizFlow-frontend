import type { TypeBreakdown } from '@/types/analytics'
import type { QuestionType } from '@/types/quiz'

type Props = {
  rows: TypeBreakdown[]
}

const TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice: 'Multiple choice',
  multi_select: 'Multi-select',
  open_ended: 'Open-ended',
  true_false: 'True / false',
}

const TYPE_COLOR: Record<QuestionType, string> = {
  multiple_choice: '#4f46e5',
  multi_select: '#a855f7',
  open_ended: '#f59e0b',
  true_false: '#10b981',
}

const SIZE = 180
const RADIUS = 80
const CENTER = SIZE / 2

function polarToCartesian(angle: number) {
  const rad = (angle - 90) * (Math.PI / 180)
  return { x: CENTER + RADIUS * Math.cos(rad), y: CENTER + RADIUS * Math.sin(rad) }
}

function arcPath(startAngle: number, endAngle: number) {
  // Single-slice pies need a full circle drawn as two halves; the standard
  // 0-360 arc renders as nothing because start === end.
  if (endAngle - startAngle >= 359.999) {
    const top = polarToCartesian(0)
    const bottom = polarToCartesian(180)
    return `M ${CENTER} ${CENTER} L ${top.x} ${top.y} A ${RADIUS} ${RADIUS} 0 1 1 ${bottom.x} ${bottom.y} A ${RADIUS} ${RADIUS} 0 1 1 ${top.x} ${top.y} Z`
  }
  const start = polarToCartesian(startAngle)
  const end = polarToCartesian(endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

export default function TypePieChart({ rows }: Props) {
  const total = rows.reduce((sum, r) => sum + r.quizCount, 0)

  return (
    <div className="border-border bg-background rounded-lg border">
      <div className="border-border border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Breakdown by question type</h3>
      </div>

      {total === 0 ? (
        <div className="text-muted-foreground p-6 text-center text-sm">
          Take a quiz to see your quiz-library composition.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:gap-8">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            width={SIZE}
            height={SIZE}
            className="flex-shrink-0"
            role="img"
            aria-label="Pie chart of quizzes by question type"
          >
            {(() => {
              let cumulative = 0
              return rows
                .filter((r) => r.quizCount > 0)
                .map((r) => {
                  const sweep = (r.quizCount / total) * 360
                  const path = arcPath(cumulative, cumulative + sweep)
                  cumulative += sweep
                  return (
                    <path
                      key={r.type}
                      d={path}
                      fill={TYPE_COLOR[r.type]}
                      stroke="white"
                      strokeWidth={1}
                    />
                  )
                })
            })()}
          </svg>

          <ul className="flex-1 space-y-2 text-sm">
            {rows.map((r) => {
              const percent = total > 0 ? Math.round((r.quizCount / total) * 100) : 0
              return (
                <li key={r.type} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-sm"
                      style={{ backgroundColor: TYPE_COLOR[r.type] }}
                    />
                    <span>{TYPE_LABEL[r.type]}</span>
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {r.quizCount} ({percent}%)
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
