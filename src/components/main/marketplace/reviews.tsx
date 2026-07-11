import { useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { useState } from 'react'

import { marketplaceService } from '@/api/services/marketplace.service'
import { MARKETPLACE_RATINGS } from '@/constants/api-endpoints'
import { useGet } from '@/hooks/useGet'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/store/use-authstore'
import type { ReviewsResponse } from '@/types/marketplace'

export function Reviews({ quizId, canRate = true }: { quizId: string; canRate?: boolean }) {
  const queryClient = useQueryClient()
  const isAuthed = useAuthStore((s) => s.isAuthed)
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const endpoint = MARKETPLACE_RATINGS(quizId)
  const params = { page: 1, pageSize: 20 }
  // Always refetch reviews when the listing opens — with the default 5-min
  // staleTime, client-side navigation served a stale cached copy and skipped
  // the fetch, so new comments only showed after a full reload (#154).
  const { data } = useGet<{ data: ReviewsResponse }>(endpoint, {
    params,
    options: { staleTime: 0 },
  })
  const reviews = data?.data.items ?? []

  const submit = async () => {
    if (!isAuthed) {
      toast.error('Log in to rate this quiz')
      return
    }
    if (score < 1) {
      toast.error('Pick a star rating')
      return
    }
    setSubmitting(true)
    try {
      await marketplaceService.rate(quizId, { score, comment: comment.trim() || undefined })
      toast.success('Thanks for your rating')
      setComment('')
      await queryClient.invalidateQueries({ queryKey: [endpoint] })
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data
        ?.error?.code
      const message =
        code === 'NOT_TAKEN'
          ? 'Take the quiz before rating it'
          : code === 'OWN_QUIZ'
            ? "You can't rate your own quiz"
            : 'Could not save rating'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Reviews</h2>

      {canRate && (
        <div className="border-border flex flex-col gap-2 rounded-lg border p-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setScore(n)} aria-label={`${n} stars`}>
                <Star
                  className={`size-6 ${
                    n <= score ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment…"
            className="border-border bg-background min-h-20 rounded-md border p-2 text-sm"
          />
          <button
            onClick={submit}
            disabled={submitting}
            className="bg-primary text-primary-foreground h-9 w-fit rounded-md px-4 text-sm font-medium disabled:opacity-50"
          >
            Submit rating
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {reviews.length === 0 && <p className="text-muted-foreground text-sm">No reviews yet.</p>}
        {reviews.map((r, i) => (
          <li key={i} className="border-border rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <span className="flex text-amber-400">
                {Array.from({ length: r.score }).map((_, k) => (
                  <Star key={k} className="size-4 fill-current" />
                ))}
              </span>
              <span className="text-sm font-medium">{r.authorName}</span>
            </div>
            {r.comment && <p className="text-muted-foreground mt-1 text-sm">{r.comment}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
