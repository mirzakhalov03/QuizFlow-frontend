import { useEffect, useState } from 'react'
import { notionService, type NotionPage } from '@/api/services/notion.service'

interface UseNotionPagesOptions {
  autoFetch?: boolean
}

interface UseNotionPagesReturn {
  pages: NotionPage[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch and manage Notion pages from connected workspace
 */
export const useNotionPages = (options: UseNotionPagesOptions = {}): UseNotionPagesReturn => {
  const { autoFetch = true } = options
  const [pages, setPages] = useState<NotionPage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await notionService.getPages()
      setPages(data)

      if (data.length === 0) {
        setError('No Notion pages found. Please check your Notion integration.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch Notion pages'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      refetch()
    }
  }, [autoFetch])

  return { pages, loading, error, refetch }
}
