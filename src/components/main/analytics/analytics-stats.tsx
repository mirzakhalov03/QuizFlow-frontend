import type { FolderStat } from '@/types/analytics'

type Props = {
  stat: FolderStat
}

export default function AnalyticsStats({ stat }: Props) {
  const hasAttempts = stat.attemptCount > 0

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat label="Attempts" value={String(stat.attemptCount)} />
      <Stat label="Average score" value={hasAttempts ? formatPercent(stat.averageScore) : '—'} />
      <Stat label="Best score" value={hasAttempts ? formatPercent(stat.bestScore) : '—'} />
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
  return `${Math.round(value)}%`
}
