import type { AnalyticsSummary } from '@/types/analytics'

type Props = {
  summary: AnalyticsSummary
}

export default function AnalyticsStats({ summary }: Props) {
  const bestScore = summary.scoreOverTime.reduce((max, p) => Math.max(max, p.score), 0)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Stat label="Quizzes taken" value={String(summary.totalQuizzesTaken)} />
      <Stat label="Average score" value={formatPercent(summary.averageScore)} />
      <Stat label="Best score" value={formatPercent(bestScore)} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-background rounded-lg border p-4">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 text-xl font-semibold sm:text-2xl">{value}</div>
    </div>
  )
}

function formatPercent(value: number) {
  if (value <= 0) return '—'
  return `${Math.round(value)}%`
}
