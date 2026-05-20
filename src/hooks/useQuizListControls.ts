import { useMemo, useState } from 'react'

import type { Quiz, QuestionType } from '@/types/quiz'

export type SortOption = 'newest' | 'oldest' | 'az' | 'za'

export function useQuizListControls(quizzes: Quiz[]) {
  const [sort, setSort] = useState<SortOption>('newest')
  const [filterTypes, setFilterTypes] = useState<QuestionType[]>([])

  const processed = useMemo(() => {
    let result = [...quizzes]

    if (filterTypes.length > 0) {
      result = result.filter((q) => q.type && filterTypes.includes(q.type))
    }

    result.sort((a, b) => {
      if (sort === 'newest')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === 'oldest')
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sort === 'az') return a.title.localeCompare(b.title)
      return b.title.localeCompare(a.title)
    })

    return result
  }, [quizzes, sort, filterTypes])

  const toggleFilterType = (type: QuestionType) => {
    setFilterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  return { processed, sort, setSort, filterTypes, toggleFilterType }
}
