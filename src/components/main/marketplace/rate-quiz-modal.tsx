import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { marketplaceService } from '@/api/services/marketplace.service'
import { toast } from '@/lib/toast'

type Props = {
  quizId: string
  open: boolean
  onClose: () => void
}

export function RateQuizModal({ quizId, open, onClose }: Props) {
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (!open) return null

  const submit = async () => {
    if (score < 1) {
      toast.error('Pick a star rating')
      return
    }
    setSubmitting(true)
    try {
      await marketplaceService.rate(quizId, { score, comment: comment.trim() || undefined })
      setDone(true)
      toast.success('Thanks for rating!')
      setTimeout(onClose, 1200)
    } catch {
      toast.error('Could not save rating')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border-border w-full max-w-sm rounded-xl border p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Rate this quiz</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {done ? (
          <p className="text-muted-foreground text-center text-sm">Rating submitted!</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setScore(n)} aria-label={`${n} stars`}>
                  <Star
                    className={`size-8 transition-colors ${
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
              className="border-border bg-background min-h-20 w-full rounded-md border p-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="border-border h-9 flex-1 rounded-md border text-sm font-medium"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="bg-primary text-primary-foreground h-9 flex-1 rounded-md text-sm font-medium disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
