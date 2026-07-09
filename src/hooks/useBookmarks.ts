import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BOOKMARKS, QUESTION_BOOKMARK } from '@/constants/api-endpoints'
import { api } from '@/api/axios-instance'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/store/use-authstore'
import { useInfinite } from '@/hooks/useInfinite'
import type { BookmarkItem } from '@/types/quiz'

type PageData = {
  success: boolean
  data: {
    count: number
    items: BookmarkItem[]
  }
}

type BookmarksInfiniteData = {
  pages: PageData[]
  pageParams: number[]
}

export function useBookmarks(delayMs?: number) {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const {
    items: bookmarks,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    observerRef,
  } = useInfinite<BookmarkItem, PageData>(BOOKMARKS, {
    page_key: 'offset',
    initialPageParam: 0,
    limit_val: 10, // Fetch in pages of 10 items to make the pagination/loading visible!
    delayMs,
    options: {
      enabled: !!user,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  })

  const bookmarkedIdsSet = new Set(bookmarks.map((item) => item.question?.id).filter(Boolean))

  const isBookmarked = (questionId: string) => {
    return bookmarkedIdsSet.has(questionId)
  }

  const addBookmarkMutation = useMutation<
    unknown,
    unknown,
    string,
    { previousBookmarks: BookmarksInfiniteData | undefined }
  >({
    mutationFn: (questionId: string) =>
      api.post(QUESTION_BOOKMARK(questionId)),
    onMutate: async (questionId) => {
      await queryClient.cancelQueries({ queryKey: [BOOKMARKS] })

      const previousBookmarks = queryClient.getQueryData<BookmarksInfiniteData>([BOOKMARKS])

      const placeholder: BookmarkItem = {
        bookmarkId: `temp-${Date.now()}`,
        bookmarkedAt: new Date().toISOString(),
        quiz: { id: '', title: '' },
        question: {
          id: questionId,
          text: '',
          type: 'multiple_choice',
          correctOptions: [],
          options: [],
          modelAnswer: null,
        },
      }

      queryClient.setQueryData<BookmarksInfiniteData>([BOOKMARKS], (old) => {
        if (!old) return old
        const pages = [...old.pages]
        if (pages.length > 0) {
          const firstPage = { ...pages[0] }
          firstPage.data = {
            ...firstPage.data,
            items: [placeholder, ...firstPage.data.items],
            count: firstPage.data.count + 1,
          }
          pages[0] = firstPage
        }
        return {
          ...old,
          pages,
        }
      })

      return { previousBookmarks }
    },
    onError: (err, _questionId, context) => {
      if (context?.previousBookmarks) {
        queryClient.setQueryData([BOOKMARKS], context.previousBookmarks)
      }

      const axiosError = err as { response?: { status?: number; data?: { detail?: string } } }
      const status = axiosError?.response?.status
      const detail = axiosError?.response?.data?.detail
      if (status === 403) {
        toast.error("Import the quiz to bookmark questions")
      } else if (detail) {
        toast.error(detail)
      } else {
        toast.error("Could not add bookmark. Please try again.")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS] })
      toast.success("Question bookmarked")
    },
  })

  const removeBookmarkMutation = useMutation<
    unknown,
    unknown,
    string,
    { previousBookmarks: BookmarksInfiniteData | undefined }
  >({
    mutationFn: (questionId: string) =>
      api.delete(QUESTION_BOOKMARK(questionId)),
    onMutate: async (questionId) => {
      await queryClient.cancelQueries({ queryKey: [BOOKMARKS] })

      const previousBookmarks = queryClient.getQueryData<BookmarksInfiniteData>([BOOKMARKS])

      queryClient.setQueryData<BookmarksInfiniteData>([BOOKMARKS], (old) => {
        if (!old) return old
        const pages = old.pages.map((page) => {
          const filteredItems = page.data.items.filter((item) => item.question?.id !== questionId)
          const removedCount = page.data.items.length - filteredItems.length
          return {
            ...page,
            data: {
              ...page.data,
              items: filteredItems,
              count: Math.max(0, page.data.count - removedCount),
            },
          }
        })
        return {
          ...old,
          pages,
        }
      })

      return { previousBookmarks }
    },
    onError: (err, _questionId, context) => {
      if (context?.previousBookmarks) {
        queryClient.setQueryData([BOOKMARKS], context.previousBookmarks)
      }
      const axiosError = err as { response?: { data?: { detail?: string } } }
      const detail = axiosError?.response?.data?.detail
      if (detail) {
        toast.error(detail)
      } else {
        toast.error("Could not remove bookmark. Please try again.")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS] })
      toast.success("Bookmark removed")
    },
  })

  const toggleBookmark = (questionId: string) => {
    if (!user) {
      toast.error('Please log in to bookmark questions')
      return
    }
    if (isBookmarked(questionId)) {
      removeBookmarkMutation.mutate(questionId)
    } else {
      addBookmarkMutation.mutate(questionId)
    }
  }

  return {
    bookmarks,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    observerRef,
    isBookmarked,
    toggleBookmark,
  }
}
