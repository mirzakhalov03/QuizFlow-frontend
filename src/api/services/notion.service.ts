import { api } from '@/api/axios-instance'
import type { ApiResponse } from '@/types/quiz'

export type NotionPage = {
  id: string
  title: string
  icon?: string
}

type NotionPagesResponse = {
  pages: NotionPage[]
}

type CreateNotionQuizPayload = {
  pageId: string
  title: string
  type: string
  questionCount: number
  userInstructions?: string
  isTimerEnabled?: boolean
  timerDuration?: number
}

export const notionService = {
  /**
   * Fetch list of Notion pages from connected workspace
   */
  async getPages(): Promise<NotionPage[]> {
    try {
      const response = await api.get<ApiResponse<NotionPagesResponse>>(
        '/integrations/notion/pages'
      )
      return response.data.data.pages || []
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch Notion pages'
      )
    }
  },

  /**
   * Create quiz from Notion page
   * Returns jobId and pollUrl for tracking job status
   */
  async createQuizFromPage(
    payload: CreateNotionQuizPayload
  ): Promise<{ jobId: string; pollUrl: string }> {
    try {
      const response = await api.post<ApiResponse<{ jobId: string; pollUrl: string }>>(
        '/quizzes/from-notion',
        payload
      )
      return response.data.data
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create quiz from Notion'
      )
    }
  },
}
