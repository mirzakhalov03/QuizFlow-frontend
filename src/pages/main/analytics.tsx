import { useEffect, useState } from 'react'
import AiFeedbackCard from '@/components/main/analytics/ai-feedback-card'
import AnalyticsStats from '@/components/main/analytics/analytics-stats'
import ApiKeyAnalytics from '@/components/main/analytics/api-key-analytics'
import FolderSelector from '@/components/main/analytics/folder-selector'
import ModelAnalytics from '@/components/main/analytics/model-analytics'
import QuizStatsList from '@/components/main/analytics/quiz-stats-list'
import ScoreOverTimeChart from '@/components/main/analytics/score-over-time-chart'
import TypePieChart from '@/components/main/analytics/type-pie-chart'
import Spinner from '@/components/ui/spinner'
import { ANALYTICS_SUMMARY } from '@/constants/api-endpoints'
import { useGet } from '@/hooks/useGet'
import { useUserProfileStore } from '@/store/userProfileStore'
import { cn } from '@/lib/utils'
import type { ApiResponse } from '@/types/api'
import type { AnalyticsSummary, FolderStat } from '@/types/analytics'

const EMPTY_STAT: FolderStat = {
  folderId: null,
  folderName: 'All quizzes',
  averageScore: 0,
  bestScore: 0,
  attemptCount: 0,
}

export default function Analytics() {
  const [selectedFolderIndex, setSelectedFolderIndex] = useState(0)

  // Ensure the AI feedback card has data even if the user lands here directly
  // (deduped + no-op once the profile is already loaded).
  const fetchProfile = useUserProfileStore((s) => s.fetchProfile)
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const { data, isLoading, isError } = useGet<ApiResponse<AnalyticsSummary>>(ANALYTICS_SUMMARY, {
    options: { staleTime: 0 },
  })

  const summary = data?.data
  const rawFolderStats = summary?.folderStats ?? []
  // Hide the "Root" bucket when it covers the same attempts as "All quizzes" —
  // i.e. when the user has no real folders.
  const folderStats =
    rawFolderStats.length === 2 && rawFolderStats[1].attemptCount === rawFolderStats[0].attemptCount
      ? [rawFolderStats[0]]
      : rawFolderStats

  // folderStats can shrink (folder deleted, no attempts in current folder) so
  // the stored index may overshoot. Clamp before any lookup or display so the
  // dropdown and stats stay in sync.
  const activeIndex = Math.min(selectedFolderIndex, Math.max(0, folderStats.length - 1))
  const selectedStat = folderStats[activeIndex] ?? EMPTY_STAT
  const quizStats = summary?.quizStats ?? []
  const scoreOverTime = summary?.scoreOverTime ?? []

  // Index 0 is "All" — show everything; otherwise restrict by folder.
  const isAll = activeIndex === 0
  const visibleQuizStats = isAll
    ? quizStats
    : quizStats.filter((q) => q.folderId === selectedStat.folderId)
  const allowedQuizIds = new Set(visibleQuizStats.map((q) => q.quizId))
  const visibleScorePoints = isAll
    ? scoreOverTime
    : scoreOverTime.filter((p) => allowedQuizIds.has(p.quizId))

  // The pie scopes to the selected folder; "All" uses the overall rollup.
  // A folder with no owned questions falls back to an empty breakdown, which
  // renders the chart's "create a quiz" empty state.
  const typeBreakdownByFolder = summary?.typeBreakdownByFolder ?? []
  const visibleTypeBreakdown = isAll
    ? (summary?.typeBreakdown ?? [])
    : (typeBreakdownByFolder.find((f) => f.folderId === selectedStat.folderId)?.typeBreakdown ?? [])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Your progress across every quiz you've taken.</p>
      </header>
      
      {isLoading ? (
        <AnalyticsSkeleton />
      ) : isError || !data?.data ? (
        <div className="border-border bg-background rounded-lg border p-8 text-center">
          <p className="text-muted-foreground text-sm">Couldn't load your analytics right now.</p>
        </div>
      ) : (
        <>
          <AiFeedbackCard />

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-muted-foreground text-sm">Showing:</span>
            <FolderSelector
              folders={folderStats}
              selectedIndex={activeIndex}
              onSelect={setSelectedFolderIndex}
            />
          </div>

          <AnalyticsStats stat={selectedStat} />
          <ScoreOverTimeChart points={visibleScorePoints} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <QuizStatsList rows={visibleQuizStats} />
            <TypePieChart rows={visibleTypeBreakdown} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ApiKeyAnalytics
              data={summary.keyUsageBreakdown ?? []}
              totalTokens={summary.totalTokensUsed ?? 0}
            />
            <ModelAnalytics
              data={summary.modelUsageBreakdown ?? []}
              totalTokens={summary.totalTokensUsed ?? 0}
            />
          </div>
        </>
      )}
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* AI Feedback Card Skeleton */}
      <div className="bg-card border border-border rounded-xl p-6 h-36 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="skeleton-shimmer h-4 w-1/4 rounded-md" />
          <div className="skeleton-shimmer h-4 w-3/4 rounded-md" />
          <div className="skeleton-shimmer h-4 w-1/2 rounded-md" />
        </div>
      </div>

      {/* Selector Skeleton */}
      <div className="flex items-center gap-2">
        <div className="skeleton-shimmer h-4 w-16 rounded-md" />
        <div className="skeleton-shimmer h-9 w-40 rounded-lg" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 h-24 flex flex-col justify-between">
            <div className="skeleton-shimmer h-3.5 w-24 rounded-md" />
            <div className="skeleton-shimmer h-6 w-16 rounded-md" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-card border border-border rounded-xl p-6 h-[320px] flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="skeleton-shimmer h-4 w-36 rounded-md" />
          <div className="skeleton-shimmer h-4 w-24 rounded-md" />
        </div>
        <div className="flex-1 flex items-end gap-4 px-2 pt-6">
          {Array.from({ length: 8 }).map((_, i) => {
            const heights = ['h-1/3', 'h-1/2', 'h-2/3', 'h-2/5', 'h-3/4', 'h-4/5', 'h-1/4', 'h-3/5']
            return (
              <div key={i} className={cn("skeleton-shimmer flex-1 rounded-t-md", heights[i])} />
            )
          })}
        </div>
      </div>

      {/* Grid Lists & Charts Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6 h-[280px] space-y-4">
          <div className="skeleton-shimmer h-4 w-32 rounded-md" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="skeleton-shimmer h-4 w-1/2 rounded-md" />
                <div className="skeleton-shimmer h-4 w-12 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 h-[280px] flex flex-col items-center justify-center gap-4">
          <div className="skeleton-shimmer h-32 w-32 rounded-full" />
          <div className="skeleton-shimmer h-4 w-28 rounded-md" />
        </div>
      </div>
    </div>
  )
}
