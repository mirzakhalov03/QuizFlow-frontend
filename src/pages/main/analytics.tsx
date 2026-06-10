import AnalyticsStats from '@/components/main/analytics/analytics-stats'
import ScoreOverTimeChart from '@/components/main/analytics/score-over-time-chart'
import TypeBreakdownTable from '@/components/main/analytics/type-breakdown-table'
import Spinner from '@/components/ui/spinner'
import { ANALYTICS_SUMMARY } from '@/constants/api-endpoints'
import { useGet } from '@/hooks/useGet'
import type { ApiResponse } from '@/types/api'
import type { AnalyticsSummary } from '@/types/analytics'

export default function Analytics() {
  const { data, isLoading, isError } = useGet<ApiResponse<AnalyticsSummary>>(ANALYTICS_SUMMARY, {
    options: { staleTime: 0 },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20" role="status" aria-live="polite">
        <Spinner />
        <span className="sr-only">Loading analytics…</span>
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="border-border bg-background rounded-lg border p-8 text-center">
        <p className="text-muted-foreground text-sm">Couldn't load your analytics right now.</p>
      </div>
    )
  }

  const summary = data.data

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">Analytics</h1>
        <p className="text-muted-foreground">Your progress across every quiz you've taken.</p>
      </header>

      <AnalyticsStats summary={summary} />
      <ScoreOverTimeChart points={summary.scoreOverTime ?? []} />
      <TypeBreakdownTable rows={summary.breakdownByType ?? []} />
    </div>
  )
}
