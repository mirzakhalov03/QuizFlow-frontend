import { useState } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import HistoryFilters from '@/components/main/history/history-filters'
import HistoryTable from '@/components/main/history/history-table'
import Spinner from '@/components/ui/spinner'
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
        <p className="text-muted-foreground">Every attempt you've made, filterable and sortable.</p>
      </header>

      <HistoryFilters
        folders={folders}
        folderId={folderId}
        onFolderChange={setFolderId}
        sort={sort}
        onSortChange={setSort}
      />

      {isError && items.length === 0 ? (
        <div className="border-border bg-background rounded-lg border p-8 text-center">
          <p className="text-muted-foreground text-sm">Couldn't load your history right now.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-20" role="status" aria-live="polite">
          <Spinner />
          <span className="sr-only">Loading history…</span>
        </div>
      ) : (
        <div className="relative">
          {isFetching && !isFetchingNextPage && (
            <div
              className="bg-background/60 absolute inset-0 z-10 flex justify-center pt-8"
              role="status"
              aria-live="polite"
            >
              <Spinner />
              <span className="sr-only">Updating history…</span>
            </div>
          )}

          <HistoryTable rows={items} />

          {hasNextPage && (
            <div ref={observerRef} className="flex justify-center py-6">
              {isFetchingNextPage ? <Spinner /> : <div className="h-2 w-2" />}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
