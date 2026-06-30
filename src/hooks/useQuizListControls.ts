import { useCallback, useMemo, useState } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { QUIZ_LIST } from '@/constants/api-endpoints'
import { useDebounce } from '@/hooks/useDebounce'
import { useGet } from '@/hooks/useGet'
import type { PaginatedResponse, Quiz, QuestionType } from '@/types/quiz'
export type SortOption = 'newest' | 'oldest'
export type StatusFilter = 'published' | 'unpublished' | 'imported'

const SEARCH_DEBOUNCE_MS = 300

export function useQuizListControls() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [filterTypes, setFilterTypes] = useState<QuestionType[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter | undefined>(undefined)

  const debouncedSearch = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS)

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      types: filterTypes.length > 0 ? filterTypes.join(',') : undefined,
      sort,
      status: statusFilter,
    }),
    [debouncedSearch, filterTypes, sort, statusFilter]
  )

  const { data, isLoading, isFetching, isError } = useGet<PaginatedResponse<Quiz>>(QUIZ_LIST, {
    params,
    options: { staleTime: 0, placeholderData: keepPreviousData },
  })

  const toggleFilterType = useCallback((type: QuestionType) => {
    setFilterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }, [])

  const toggleStatusFilter = useCallback((status: StatusFilter) => {
    setStatusFilter((prev) => (prev === status ? undefined : status))
  }, [])

  return {
    items: data?.data?.items ?? [],
    total: data?.data?.pagination?.count ?? 0,
    isLoading,
    isFetching,
    isError,
    isFiltering: debouncedSearch.length > 0 || filterTypes.length > 0 || statusFilter !== undefined,
    search,
    setSearch,
    sort,
    setSort,
    filterTypes,
    toggleFilterType,
    statusFilter,
    toggleStatusFilter,
  }
}
