import { MARKETPLACE, MARKETPLACE_LISTING, MARKETPLACE_RATINGS } from '@/constants/api-endpoints'
import type { MarketplaceCategory } from '@/types/marketplace'

import { api as axiosInstance } from '../axios-instance'

export const marketplaceService = {
  publish: async (
    quizId: string,
    body: { description?: string; category: MarketplaceCategory; customCategory?: string }
  ) => (await axiosInstance.post(MARKETPLACE_LISTING(quizId), body)).data,

  update: async (
    quizId: string,
    body: { description?: string; category?: MarketplaceCategory; customCategory?: string | null }
  ) => (await axiosInstance.patch(MARKETPLACE_LISTING(quizId), body)).data,

  unpublish: async (quizId: string) =>
    (await axiosInstance.delete(MARKETPLACE_LISTING(quizId))).data,

  rate: async (quizId: string, body: { score: number; comment?: string }) =>
    (await axiosInstance.post(MARKETPLACE_RATINGS(quizId), body)).data,

  getListing: async (quizId: string) => (await axiosInstance.get(MARKETPLACE_LISTING(quizId))).data,

  browse: async (params: Record<string, string | number | undefined>) =>
    (await axiosInstance.get(MARKETPLACE, { params })).data,
}
