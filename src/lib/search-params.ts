import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(20),
})

export type Pagination = z.infer<typeof paginationSchema>

export function useTypedSearch<S extends z.ZodTypeAny>(schema: S): z.infer<S> {
  const [params] = useSearchParams()
  return useMemo(() => schema.parse(Object.fromEntries(params)), [params, schema])
}
