import type { FolderStat } from '@/types/analytics'

type Props = {
  stat: FolderStat
}

export default function AnalyticsStats({ stat }: Props) {
  const hasAttempts = stat.attemptCount > 0

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <Stat label="Attempts" value={String(stat.attemptCount)} />
      <Stat label="Avg" value={hasAttempts ? formatPercent(stat.averageScore) : '—'} />
      <Stat label="Best" value={hasAttempts ? formatPercent(stat.bestScore) : '—'} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-background rounded-lg border p-3 sm:p-4">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 text-lg font-semibold sm:text-2xl">{value}</div>
    </div>
  )
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}
