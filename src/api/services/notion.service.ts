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

export const notionService = {
  async getPages(): Promise<NotionPage[]> {
    const response = await api.get<ApiResponse<NotionPagesResponse>>('/integrations/notion/pages')
    return response.data.data.pages ?? []
  },
}
