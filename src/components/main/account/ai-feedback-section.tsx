import { Sparkles, AlertTriangle, Lightbulb } from 'lucide-react'
import { useUserProfileStore } from '@/store/userProfileStore'

const formatGeneratedAt = (iso: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function AiFeedbackSection() {
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
    <div className="border-border bg-background rounded-2xl border p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Learning Feedback</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Personalized insights generated from your quiz history.
            </p>
          </div>
        </div>
        {generatedAt && (
          <span className="text-muted-foreground shrink-0 text-xs">Updated {generatedAt}</span>
        )}
      </div>

      <div className="mt-5 space-y-6">
        {/* Summary */}
        {feedback.summary && (
          <p className="text-foreground/90 text-sm leading-relaxed">{feedback.summary}</p>
        )}

        {/* Weak topics */}
        {weakTopics.length > 0 && (
          <div>
            <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
              <AlertTriangle size={14} className="text-amber-500" />
              Topics to focus on
            </div>
            <div className="flex flex-wrap gap-2">
              {weakTopics.map((topic, i) => (
                <span
                  key={i}
                  className="bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full px-3 py-1 text-xs font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
              <Lightbulb size={14} className="text-emerald-500" />
              Recommendations
            </div>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed">
                  <span className="text-emerald-500">•</span>
                  <span className="text-foreground/90">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
