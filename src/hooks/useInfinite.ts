import { useEffect, useRef, useCallback, useMemo } from 'react'
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query'
import { AxiosRequestConfig } from 'axios'
import { getRequest } from './useGet'

export type ICustomUseInfiniteQueryOptions<TQueryFnData, TError, TData> = Partial<
  UseInfiniteQueryOptions<TQueryFnData, TError, TData, QueryKey, number>
>

export type UseInfiniteArgs<TQueryFnData = unknown, TError = unknown, TData = unknown> = {
  deps?: QueryKey
  options?: ICustomUseInfiniteQueryOptions<TQueryFnData, TError, TData>
  config?: Omit<AxiosRequestConfig, 'params'>
  params?: Record<string, unknown>
  page_key?: string
  initialPageParam?: number
  limit_key?: string
  limit_val?: number
  rootMargin?: string
  delayMs?: number
}

export const useInfinite = <
  TItem = unknown,
  TQueryFnData = unknown,
  TError = unknown,
  TData = InfiniteData<TQueryFnData, number>,
>(
  url: string,
  args?: UseInfiniteArgs<TQueryFnData, TError, TData>
) => {
  const {
    deps = [],
    options,
    config,
    params,
    page_key = 'page',
    initialPageParam = 1,
    limit_key = 'limit',
    limit_val = 20,
    rootMargin = '200px',
    delayMs,
  } = args || {}

  const cleanedParams = useMemo(() => {
    if (!params) return {}
    return Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== ''
      )
    )
  }, [params])

  const queryKey = useMemo(() => {
    return [url, ...deps, cleanedParams]
  }, [url, deps, cleanedParams])

  const queryResult = useInfiniteQuery<TQueryFnData, TError, TData, QueryKey, number>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      if (delayMs) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
      const response = await getRequest(url, {
        ...config,
        params: {
          ...cleanedParams,
          [page_key]: pageParam,
          [limit_key]: limit_val,
        },
      })
      return response as TQueryFnData
    },
    initialPageParam,
    getNextPageParam: (
      lastPage: TQueryFnData,
      allPages: TQueryFnData[],
      lastPageParam: number,
      allPageParams: number[]
    ): number | undefined | null => {
      if (options?.getNextPageParam) {
        return options.getNextPageParam(lastPage, allPages, lastPageParam, allPageParams)
      }

      const lastPageObj = lastPage as Record<string, unknown> | null | undefined
      if (!lastPageObj || typeof lastPageObj !== 'object') return undefined

      const dataObj =
        'data' in lastPageObj && lastPageObj.data && typeof lastPageObj.data === 'object'
          ? (lastPageObj.data as Record<string, unknown>)
          : lastPageObj

      if (dataObj.pagination && typeof dataObj.pagination === 'object') {
        const pag = dataObj.pagination as Record<string, unknown>
        const limit = typeof pag.limit === 'number' ? pag.limit : limit_val
        const offset = typeof pag.offset === 'number' ? pag.offset : 0
        const nextOffset = offset + limit

        // Support both 'total' (explicit total count) and 'count'
        const total =
          typeof pag.total === 'number'
            ? pag.total
            : typeof pag.count === 'number'
              ? pag.count
              : null
        if (total !== null) {
          // If total <= limit it might be the page-count, not total items.
          // Fall back to items-length heuristic in that case.
          if (total > limit) {
            return nextOffset < total ? nextOffset : undefined
          }
        }
        // Fallback: if we received a full page of items, assume there are more
        const itemsList = dataObj.items || dataObj.results
        if (Array.isArray(itemsList)) {
          return itemsList.length >= limit ? nextOffset : undefined
        }
        return undefined
      }

      const pageNum = dataObj.page ?? dataObj.current_page
      const sizeVal = dataObj.pageSize ?? dataObj.limit ?? limit_val
      const totalItems = dataObj.total ?? dataObj.count ?? dataObj.total_pages

      if (typeof pageNum === 'number' && typeof totalItems === 'number') {
        if (dataObj.total_pages && pageNum >= (dataObj.total_pages as number)) {
          return undefined
        }
        if (typeof sizeVal === 'number' && pageNum * sizeVal >= totalItems) {
          return undefined
        }
        return pageNum + 1
      }

      const itemsList =
        dataObj.items || dataObj.results || (Array.isArray(dataObj) ? dataObj : null)
      if (Array.isArray(itemsList)) {
        if (itemsList.length < limit_val) {
          return undefined
        }
        return page_key === 'offset'
          ? allPages.length * limit_val + initialPageParam
          : allPages.length + initialPageParam
      }

      return undefined
    },
    ...options,
  })

  const { fetchNextPage, hasNextPage, isFetchingNextPage, isError, data } = queryResult

  const items = useMemo<TItem[]>(() => {
    if (!data) return []

    const pages = (data as unknown as InfiniteData<unknown, number>).pages || []

    return pages.flatMap((page: unknown) => {
      if (!page || typeof page !== 'object') return []

      const dataObj =
        'data' in page && page.data && typeof page.data === 'object' ? page.data : page
      if (!dataObj || typeof dataObj !== 'object') return []

      const obj = dataObj as Record<string, unknown>

      if (Array.isArray(obj.items)) return obj.items as TItem[]
      if (Array.isArray(obj.results)) return obj.results as TItem[]
      if (Array.isArray(obj)) return obj as TItem[]

      return []
    })
  }, [data])

  const observerRef = useRef<IntersectionObserver | null>(null)

  const bottomRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      if (!node) return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !isError) {
            fetchNextPage()
          }
        },
        {
          rootMargin,
        }
      )

      observerRef.current.observe(node)

      // IntersectionObserver only fires on *transitions*. If the sentinel is
      // already visible when the observer is first attached (e.g. the initial
      // page doesn't fill the viewport), the callback never fires. Eagerly
      // trigger fetchNextPage in that case.
      if (hasNextPage && !isFetchingNextPage && !isError) {
        const rect = node.getBoundingClientRect()
        const inViewport =
          rect.top <
          (window.innerHeight || document.documentElement.clientHeight) + parseFloat(rootMargin)
        if (inViewport) {
          fetchNextPage()
        }
      }
    },
    [hasNextPage, isFetchingNextPage, isError, fetchNextPage, rootMargin]
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return {
    ...queryResult,
    items,
    observerRef: bottomRef,
  }
}
