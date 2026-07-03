import { useState } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import HistoryFilters from '@/components/main/history/history-filters'
import HistoryPagination from '@/components/main/history/history-pagination'
import HistoryTable from '@/components/main/history/history-table'
import Spinner from '@/components/ui/spinner'
import { FOLDERS, QUIZ_HISTORY } from '@/constants/api-endpoints'
import { useGet } from '@/hooks/useGet'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { HistoryLimit, HistoryResponse, HistorySort } from '@/types/analytics'
import type { Folder } from '@/types/folder'

export default function History() {
  const [folderId, setFolderId] = useState<string | null>(null)
  const [limit, setLimit] = useState<HistoryLimit>(10)
  const [sort, setSort] = useState<HistorySort>('recent')
  const [page, setPage] = useState(1)

  const params = new URLSearchParams()
  if (folderId) params.set('folderId', folderId)
  params.set('limit', String(limit))
  params.set('page', String(page))
  params.set('sort', sort)
  const historyUrl = `${QUIZ_HISTORY}?${params.toString()}`

  const foldersQuery = useGet<PaginatedResponse<Folder>>(FOLDERS)
  const historyQuery = useGet<ApiResponse<HistoryResponse>>(historyUrl, {
    options: { staleTime: 0, placeholderData: keepPreviousData },
  })

  const folders = foldersQuery.data?.data?.items ?? []
  const history = historyQuery.data?.data

  // Changing any filter resets to the first page.
  const handleFolderChange = (id: string | null) => {
    setFolderId(id)
    setPage(1)
  }
  const handleLimitChange = (n: HistoryLimit) => {
    setLimit(n)
    setPage(1)
  }
  const handleSortChange = (s: HistorySort) => {
    setSort(s)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-muted-foreground">Every attempt you've made, filterable and sortable.</p>
      </header>

      <HistoryFilters
        folders={folders}
        folderId={folderId}
        onFolderChange={handleFolderChange}
        limit={limit}
        onLimitChange={handleLimitChange}
        sort={sort}
        onSortChange={handleSortChange}
      />

      {(historyQuery.isError && !history) || (!history && !historyQuery.isLoading) ? (
        <div className="border-border bg-background rounded-lg border p-8 text-center">
          <p className="text-muted-foreground text-sm">Couldn't load your history right now.</p>
        </div>
      ) : !history ? (
        <div className="flex justify-center py-20" role="status" aria-live="polite">
          <Spinner />
          <span className="sr-only">Loading history…</span>
        </div>
      ) : (
        <>
          <div className="relative">
            {historyQuery.isFetching && (
              <div
                className="bg-background/60 absolute inset-0 z-10 flex justify-center pt-8"
                role="status"
                aria-live="polite"
              >
                <Spinner />
                <span className="sr-only">Updating history…</span>
              </div>
            )}
            <HistoryTable rows={history.items} />
          </div>

          <HistoryPagination
            page={page}
            limit={limit}
            total={history.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
