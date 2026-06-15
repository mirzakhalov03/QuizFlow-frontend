import HistoryTable from '@/components/main/history/history-table'
import Spinner from '@/components/ui/spinner'
import { ANALYTICS_SUMMARY } from '@/constants/api-endpoints'
import { useGet } from '@/hooks/useGet'
import type { ApiResponse } from '@/types/api'
import type { AnalyticsSummary } from '@/types/analytics'

export default function History() {
  const { data, isLoading, isError } = useGet<ApiResponse<AnalyticsSummary>>(ANALYTICS_SUMMARY, {
    options: { staleTime: 0 },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20" role="status" aria-live="polite">
        <Spinner />
        <span className="sr-only">Loading history…</span>
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="border-border bg-background rounded-lg border p-8 text-center">
        <p className="text-muted-foreground text-sm">Couldn't load your history right now.</p>
      </div>
    )
  }

  const summary = data.data

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">History</h1>
        <p className="text-muted-foreground">Every quiz you've completed, with your latest score.</p>
      </header>

      <HistoryTable rows={summary.history ?? []} />
    </div>
  )
}
