import { useMemo, useState } from 'react'
import { Cpu } from 'lucide-react'
import type { ModelUsageSummary } from '@/types/analytics'

type Props = {
  data: ModelUsageSummary[]
}

const MODEL_MAPPING: Record<string, { label: string; color: string; provider: string }> = {
  'google/gemini-3.5-flash': {
    label: 'Gemini 3.5 Flash',
    color: '#14B8A6', // Neon Teal
    provider: 'Google',
  },
  'openai/gpt-4o-mini': {
    label: 'GPT-4o Mini',
    color: '#10B981', // Neon Green
    provider: 'OpenAI',
  },
  'deepseek/deepseek-chat-v3': {
    label: 'DeepSeek V3',
    color: '#3B82F6', // Neon Blue
    provider: 'DeepSeek',
  },
  'meta-llama/llama-3.3-70b-instruct': {
    label: 'Llama 3.3 70B',
    color: '#A855F7', // Neon Violet
    provider: 'Meta',
  },
}

function getModelDetails(modelName: string) {
  return (
    MODEL_MAPPING[modelName] ?? {
      label: modelName,
      color: '#64748B', // Slate
      provider: 'AI Provider',
    }
  )
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export default function ModelAnalytics({ data }: Props) {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null)
  const activeData = useMemo(() => data.filter((m) => m.tokensUsed > 0), [data])

  if (activeData.length === 0) {
    return (
      <div className="border-border bg-background flex min-h-[350px] flex-col items-center justify-center rounded-lg border p-8 text-center">
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
    <div className="border-border bg-background flex min-h-[350px] flex-col rounded-lg border p-4 sm:p-6">
      <h3 className="mb-4 text-sm font-semibold sm:mb-6">Token usage by AI model</h3>

      <div className="flex flex-1 flex-col justify-center gap-4">
        {activeData.map((item) => {
          const { label, color, provider } = getModelDetails(item.modelName)
          const isHovered = hoveredModel === item.modelName

          return (
            <div
              key={item.modelName}
              className="bg-muted/30 border-border/50 hover:bg-muted/50 cursor-default space-y-3 rounded-xl border p-4 transition-all duration-300"
              style={{
                opacity: hoveredModel && !isHovered ? 0.45 : 1,
                transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
                borderColor: isHovered ? color : undefined,
                boxShadow: isHovered ? `0 0 12px ${color}1A` : undefined,
              }}
              onMouseEnter={() => setHoveredModel(item.modelName)}
              onMouseLeave={() => setHoveredModel(null)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 animate-pulse rounded-full"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 6px ${color}80`,
                    }}
                  />
                  <span className="text-foreground truncate text-sm font-semibold">{label}</span>
                  <span className="bg-muted border-border/50 text-muted-foreground shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase">
                    {provider}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-sm font-bold tabular-nums" style={{ color }}>
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="bg-muted/70 h-2 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: color,
                    boxShadow: isHovered ? `0 0 12px ${color}70` : `0 0 8px ${color}40`,
                  }}
                />
              </div>

              <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                <span>{formatTokens(item.tokensUsed)} tokens</span>
                <span>
                  {item.quizCount} {item.quizCount === 1 ? 'quiz' : 'quizzes'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
