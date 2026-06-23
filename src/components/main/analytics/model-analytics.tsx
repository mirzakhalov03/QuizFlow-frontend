import { useMemo, useState } from 'react'
import { Cpu } from 'lucide-react'
import type { ModelUsageSummary } from '@/types/analytics'
import { getModelByValue } from '@/lib/models'

type Props = {
  data: ModelUsageSummary[]
  totalTokens: number
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export default function ModelAnalytics({ data, totalTokens }: Props) {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null)

  const activeData = useMemo(() => data.filter((m) => m.tokensUsed > 0), [data])

  if (activeData.length === 0) {
    return (
      <div className="border-border bg-background flex flex-col items-center justify-center rounded-lg border p-8 text-center">
        <div className="text-muted-foreground mb-3 flex h-10 w-10 items-center justify-center rounded-full opacity-40">
          <Cpu size={20} />
        </div>
        <p className="text-muted-foreground text-sm">
          No model usage data yet — generate a quiz to see your AI model usage breakdown.
        </p>
      </div>
    )
  }

  return (
    <div className="border-border bg-background flex flex-col rounded-lg border p-4 sm:p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-4 flex items-baseline justify-between sm:mb-5">
        <h3 className="text-sm font-semibold">Token usage by AI model</h3>
        <span className="text-muted-foreground text-xs tabular-nums">
          {formatTokens(totalTokens)} total
        </span>
      </div>

      {/* ── Segmented bar ───────────────────────────────────────────────────── */}
      <div
        className="mb-5 flex h-4 w-full overflow-hidden rounded-full"
        role="img"
        aria-label="Segmented bar chart of token usage by AI model"
      >
        {activeData.map((item, i) => {
          const { color } = getModelByValue(item.modelName)
          const isHovered = hoveredModel === item.modelName
          const isFirst = i === 0
          const isLast = i === activeData.length - 1
          // Tiny 1px transparent gap between segments
          const marginRight = isLast ? 0 : 1

          return (
            <div
              key={item.modelName}
              className="h-full transition-all duration-300"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: color,
                opacity: hoveredModel && !isHovered ? 0.25 : 1,
                marginRight,
                borderRadius:
                  isFirst && isLast
                    ? '9999px'
                    : isFirst
                      ? '9999px 0 0 9999px'
                      : isLast
                        ? '0 9999px 9999px 0'
                        : undefined,
                boxShadow: isHovered ? `0 0 10px ${color}80` : undefined,
                transform: isHovered ? 'scaleY(1.15)' : 'scaleY(1)',
              }}
              onMouseEnter={() => setHoveredModel(item.modelName)}
              onMouseLeave={() => setHoveredModel(null)}
            />
          )
        })}
      </div>

      {/* ── Legend ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        {activeData.map((item) => {
          const { label, color, provider } = getModelByValue(item.modelName)
          const isHovered = hoveredModel === item.modelName

          return (
            <div
              key={item.modelName}
              className="flex items-center gap-6 rounded-lg px-3 py-2.5 transition-all duration-200"
              style={{
                backgroundColor: isHovered ? `${color}12` : undefined,
                borderLeft: `3px solid ${color}`,
                opacity: hoveredModel && !isHovered ? 0.4 : 1,
              }}
              onMouseEnter={() => setHoveredModel(item.modelName)}
              onMouseLeave={() => setHoveredModel(null)}
            >
              {/* Percentage */}
              <span className="w-9 shrink-0 text-sm font-bold tabular-nums" style={{ color }}>
                {item.percentage}%
              </span>

              {/* Name + provider */}
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <span className="text-foreground truncate text-xs font-semibold">{label}</span>
                <span className="bg-muted border-border/50 text-muted-foreground shrink-0 rounded border px-1 py-px text-[8px] font-semibold tracking-wider uppercase">
                  {provider}
                </span>
              </div>

              {/* Tokens + quizzes */}
              <span className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
                {formatTokens(item.tokensUsed)} · {item.quizCount}{' '}
                {item.quizCount === 1 ? 'quiz' : 'quizzes'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
