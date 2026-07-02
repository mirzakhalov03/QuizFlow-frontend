import { useCallback, useMemo, useState } from 'react'
import { QUIZ_LIST } from '@/constants/api-endpoints'
import { useDebounce } from '@/hooks/useDebounce'
import { useInfinite } from '@/hooks/useInfinite'
import type { Quiz, QuestionType } from '@/types/quiz'

export type SortOption = 'newest' | 'oldest'
export type StatusFilter = 'published' | 'unpublished' | 'imported'

const SEARCH_DEBOUNCE_MS = 300
const LIMIT_PER_PAGE = 12

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

  const {
    items,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    isError,
    observerRef,
  } = useInfinite<Quiz>(QUIZ_LIST, {
    params,
    page_key: 'offset',
    initialPageParam: 0,
    limit_val: LIMIT_PER_PAGE,
    options: {
      staleTime: 0,
    },
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
    items,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
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
    observerRef,
  }
}

