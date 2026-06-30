import { useState } from 'react'
import HistoryFilters from '@/components/main/history/history-filters'
import HistoryTable from '@/components/main/history/history-table'
import Spinner from '@/components/ui/spinner'
import { FOLDERS, QUIZ_HISTORY } from '@/constants/api-endpoints'
import { useGet } from '@/hooks/useGet'
import type { ApiResponse } from '@/types/api'
import type { HistoryLimit, HistoryResponse, HistorySort } from '@/types/analytics'
import type { Folder } from '@/types/folder'

export default function History() {
  const [folderId, setFolderId] = useState<string | null>(null)
  const [limit, setLimit] = useState<HistoryLimit>(10)
  const [sort, setSort] = useState<HistorySort>('recent')

  const params = new URLSearchParams()
  if (folderId) params.set('folderId', folderId)
  params.set('limit', String(limit))
  params.set('sort', sort)
  const historyUrl = `${QUIZ_HISTORY}?${params.toString()}`

  const foldersQuery = useGet<ApiResponse<Folder[]>>(FOLDERS)
  const historyQuery = useGet<ApiResponse<HistoryResponse>>(historyUrl, {
    options: { staleTime: 0 },
  })

  const folders = foldersQuery.data?.data ?? []

  if (historyQuery.isLoading && !historyQuery.data) {
    return (
      <div className="flex justify-center py-20" role="status" aria-live="polite">
        <Spinner />
        <span className="sr-only">Loading history…</span>
      </div>
    )
  }

  if (historyQuery.isError || !historyQuery.data?.data) {
    return (
      <div className="border-border bg-background rounded-lg border p-8 text-center">
        <p className="text-muted-foreground text-sm">Couldn't load your history right now.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">History</h1>
        <p className="text-muted-foreground">Every attempt you've made, filterable and sortable.</p>
      </header>

      <HistoryFilters
        folders={folders}
        folderId={folderId}
        onFolderChange={setFolderId}
        limit={limit}
        onLimitChange={setLimit}
        sort={sort}
        onSortChange={setSort}
      />

      <HistoryTable rows={historyQuery.data.data.items} />
    </div>
  )
}
