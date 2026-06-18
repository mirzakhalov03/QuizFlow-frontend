import { useMemo, useState } from 'react'
import { Key } from 'lucide-react'
import type { KeyUsageSummary } from '@/types/analytics'

type Props = {
  data: KeyUsageSummary[]
  totalTokens: number
}

const PALETTE = ['#A855F7', '#14B8A6', '#F43F5E', '#3B82F6', '#F59E0B']

const RADIUS = 80
const STROKE = 20
const SIZE = (RADIUS + STROKE) * 2
const CENTER = SIZE / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
/** Small gap between segments in stroke-dasharray units */
const GAP = 6

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export default function ApiKeyAnalytics({ data, totalTokens }: Props) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const activeData = useMemo(() => data.filter((k) => k.tokensUsed > 0), [data])

  if (activeData.length === 0) {
    return (
      <div className="border-border bg-background rounded-lg border p-8 text-center">
        <div className="text-muted-foreground mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full opacity-40">
          <Key size={20} />
        </div>
        <p className="text-muted-foreground text-sm">
          No token usage data yet — generate a quiz to see your API key usage breakdown.
        </p>
      </div>
    )
  }

  // Build the donut segments. Each circle uses stroke-dasharray to paint
  // exactly its arc length, and stroke-dashoffset to rotate it into position.
  let cumulativeOffset = 0
  const segments = activeData.map((item, i) => {
    const ratio = totalTokens > 0 ? item.tokensUsed / totalTokens : 0
    const arcLength = Math.max(ratio * CIRCUMFERENCE - GAP, 0)
    const offset = CIRCUMFERENCE - cumulativeOffset
    cumulativeOffset += arcLength + GAP

    const color = PALETTE[i % PALETTE.length]
    const id = item.keyId ?? '__default__'
    const isHovered = hoveredKey === id

    return (
      <circle
        key={id}
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={isHovered ? STROKE + 4 : STROKE}
        strokeDasharray={`${arcLength} ${CIRCUMFERENCE - arcLength}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-300"
        style={{ opacity: hoveredKey && !isHovered ? 0.35 : 1 }}
        onMouseEnter={() => setHoveredKey(id)}
        onMouseLeave={() => setHoveredKey(null)}
      />
    )
  })

  return (
    <div className="border-border bg-background rounded-lg border p-4 sm:p-6">
      <h3 className="mb-4 text-sm font-semibold sm:mb-6">Token usage by API key</h3>

      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-8">
        {/* Donut chart */}
        <div className="relative mx-auto flex aspect-square w-full max-w-[240px] items-center justify-center">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="h-full w-full"
            role="img"
            aria-label="Donut chart of token usage by API key"
          >
            {/* Background ring */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              className="stroke-border"
              strokeWidth={STROKE}
            />
            {/* Segment group, rotated so arcs start from 12 o'clock */}
            <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>{segments}</g>
          </svg>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
              Total
            </span>
            <span className="text-foreground text-2xl font-bold tabular-nums sm:text-3xl">
              {formatTokens(totalTokens)}
            </span>
            <span className="text-muted-foreground text-[10px]">tokens</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5">
          {activeData.map((item, i) => {
            const color = PALETTE[i % PALETTE.length]
            const id = item.keyId ?? '__default__'
            const isDefault = item.keyId === null
            const isHovered = hoveredKey === id

            return (
              <div
                key={id}
                className="bg-muted/40 hover:bg-muted/80 flex items-center justify-between rounded-lg py-3 pr-4 pl-3 transition-all duration-200"
                style={{
                  borderLeft: `3px solid ${color}`,
                  opacity: hoveredKey && !isHovered ? 0.5 : 1,
                  transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
                }}
                onMouseEnter={() => setHoveredKey(id)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground truncate text-sm font-medium">
                        {item.keyName}
                      </span>
                      {isDefault && (
                        <span className="bg-primary/15 text-primary shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {formatTokens(item.tokensUsed)} tokens · {item.quizCount}{' '}
                      {item.quizCount === 1 ? 'quiz' : 'quizzes'}
                    </p>
                  </div>
                </div>

                <span
                  className="ml-3 shrink-0 text-lg font-bold tabular-nums"
                  style={{ color }}
                >
                  {item.percentage}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
