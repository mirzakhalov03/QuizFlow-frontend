import { Sparkles, Target, ArrowRight } from 'lucide-react'
import { useUserProfileStore } from '@/store/userProfileStore'

const formatGeneratedAt = (iso: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export default function AiFeedbackCard() {
  const { aiFeedback, aiFeedbackGeneratedAt } = useUserProfileStore()

  // Only render once the worker has produced feedback for this user.
  // The stored record wraps the feedback under `data`.
  const feedback = aiFeedback?.data
  if (!feedback) return null

  const generatedAt = formatGeneratedAt(aiFeedbackGeneratedAt)
  const weakTopics = feedback.weakTopics ?? []
  const recommendations = feedback.recommendations ?? []

  // Guard against a non-null but empty/partial record producing a blank card.
  if (!feedback.summary && weakTopics.length === 0 && recommendations.length === 0) return null

  return (
    <section className="border-border bg-card bg-linear-to-br from-primary/8 via-primary/3 to-card relative overflow-hidden rounded-2xl border p-5 shadow-sm sm:p-6">
      {/* Soft glow accent */}
      <div className="bg-primary/10 pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/15 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Your AI Study Coach</h2>
              <p className="text-muted-foreground text-sm">Personalized from your quiz history</p>
            </div>
          </div>
          {generatedAt && (
            <span className="bg-background/60 text-muted-foreground shrink-0 rounded-full px-3 py-1 text-xs">
              Updated {generatedAt}
            </span>
          )}
        </div>

        {/* Summary */}
        {feedback.summary && (
          <p className="text-foreground/90 mt-5 text-[15px] leading-relaxed">{feedback.summary}</p>
        )}

        {/* Two-up: focus areas + recommendations */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {weakTopics.length > 0 && (
            <div className="border-border/60 bg-background/50 rounded-xl border p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Target size={16} className="text-amber-500" />
                Focus areas
              </div>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="border-border/60 bg-background/50 rounded-xl border p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Sparkles size={16} className="text-emerald-500" />
                Try this next
              </div>
              <ul className="space-y-2.5">
                {recommendations.map((rec) => (
                  <li key={rec} className="flex gap-2.5 text-sm leading-relaxed">
                    <ArrowRight size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="text-foreground/90">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
