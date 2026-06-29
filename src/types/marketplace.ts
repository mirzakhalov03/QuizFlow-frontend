export const MARKETPLACE_CATEGORIES = [
  'general',
  'science',
  'math',
  'history',
  'language',
  'technology',
  'business',
  'arts',
  'geography',
  'health',
  'other',
] as const
export type MarketplaceCategory = (typeof MARKETPLACE_CATEGORIES)[number]

export type ListingCard = {
  quizId: string
  shareToken: string | null
  title: string
  description: string | null
  category: MarketplaceCategory
  customCategory: string | null
  difficulty: string | null
  authorName: string
  questionCount: number
  playCount: number
  ratingAvg: number
  ratingCount: number
  isMine: boolean
  isCloned: boolean
  listedAt: string
}

export type BrowseResponse = {
  items: ListingCard[]
  page: number
  pageSize: number
  total: number
}

export type ReviewItem = {
  score: number
  comment: string | null
  authorName: string
  createdAt: string
}

export type ReviewsResponse = {
  items: ReviewItem[]
  page: number
  pageSize: number
  total: number
}

export type MarketplaceSort = 'popular' | 'recent' | 'rating'
