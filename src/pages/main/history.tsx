import { useState } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import HistoryFilters from '@/components/main/history/history-filters'
import HistoryTable from '@/components/main/history/history-table'
import { FOLDERS, QUIZ_HISTORY } from '@/constants/api-endpoints'
import { useGet } from '@/hooks/useGet'
import { useInfinite } from '@/hooks/useInfinite'
import type { PaginatedResponse } from '@/types/api'
import type { HistoryItem, HistorySort } from '@/types/analytics'
import type { Folder } from '@/types/folder'

export default function History() {
  const [folderId, setFolderId] = useState<string | null>(null)
  const [sort, setSort] = useState<HistorySort>('recent')

  const foldersQuery = useGet<PaginatedResponse<Folder>>(FOLDERS)
  const {
    items,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    observerRef,
    isPlaceholderData,
  } = useInfinite<HistoryItem>(QUIZ_HISTORY, {
    params: { folderId, sort },
    limit_val: 20,
    options: { staleTime: 0, placeholderData: keepPreviousData },
  })

  const folders = foldersQuery.data?.data?.items ?? []

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Every attempt you've made, filterable and sortable.
        </p>
      </header>

      <HistoryFilters
        folders={folders}
        folderId={folderId}
        onFolderChange={setFolderId}
        sort={sort}
        onSortChange={setSort}
      />

      {isError && (isPlaceholderData || items.length === 0) ? (
        <div className="border-border bg-background rounded-lg border p-8 text-center">
          <p className="text-muted-foreground text-sm">Couldn't load your history right now.</p>
        </div>
      ) : isLoading || (isFetching && !isPlaceholderData && !isFetchingNextPage) ? (
        <HistoryTableSkeleton />
      ) : (
        <div className="relative">
          <HistoryTable rows={items} isFetchingNextPage={isFetchingNextPage} />

          {hasNextPage && !isPlaceholderData && <div ref={observerRef} className="h-6" />}
        </div>
      )}
    </div>
  )
}

function HistoryTableSkeleton() {
  return (
    <div className="bg-card border-border animate-pulse overflow-hidden rounded-xl border shadow-sm">
      {/* Table Header skeleton */}
      <div className="border-border bg-muted/40 grid grid-cols-5 gap-4 border-b p-4">
        <div className="skeleton-shimmer h-4 w-2/3 rounded-md" />
        <div className="skeleton-shimmer h-4 w-1/2 rounded-md" />
        <div className="skeleton-shimmer h-4 w-1/3 rounded-md" />
        <div className="skeleton-shimmer h-4 w-1/3 rounded-md" />
        <div className="skeleton-shimmer h-4 w-1/4 animate-none rounded-md" />
      </div>

      {/* Table Rows skeleton */}
      <div className="divide-border divide-y">
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 items-center gap-4 p-4">
            <div className="skeleton-shimmer h-4 w-5/6 rounded-md" />
            <div className="skeleton-shimmer h-4 w-2/3 rounded-md" />
            <div className="skeleton-shimmer h-4 w-1/2 rounded-md" />
            <div className="skeleton-shimmer h-4 w-1/2 rounded-md" />
            <div className="skeleton-shimmer h-8 w-20 justify-self-end rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
