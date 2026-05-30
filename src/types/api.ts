export type ApiResponse<T> = {
  success: boolean
  data: T
}

export type PaginatedResponse<T> = ApiResponse<{
  items: T[]
  pagination: {
    limit: number
    offset: number
    count: number
  }
}>
