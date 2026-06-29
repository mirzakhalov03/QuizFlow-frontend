import { AlertTriangle, Sparkles, Upload, X } from 'lucide-react'

import { useQuizJobPoller } from '@/hooks/useQuizJobPoller'
import { usePendingJobsStore, type PendingJob } from '@/store/use-pending-jobs-store'
import { TYPE_COLORS, TYPE_LABELS } from '@/components/main/quizzes/utils'
import type { QuestionType } from '@/types/quiz'
import { toast } from '@/lib/toast'

export function PendingQuizCard({ jobId, title, type, status, error, folderId }: PendingJob) {
  const removeJob = usePendingJobsStore((s) => s.removeJob)
  const markJobFailed = usePendingJobsStore((s) => s.markJobFailed)

  useQuizJobPoller(status === 'generating' ? jobId : null, {
    folderId,
    onDone: () => {
      removeJob(jobId)
      toast.success('Quiz ready!', {
      description: `"${title}" has been generated successfully.`,
      })
    },
    onFailed: (err) => {
      markJobFailed(jobId, err)
    },
  })

  const questionType = type as QuestionType
  const typeBadge = questionType && TYPE_LABELS[questionType] && (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium opacity-50 ${TYPE_COLORS[questionType]}`}
    >
      {TYPE_LABELS[questionType]}
    </span>
  )

  if (status === 'failed') {
    return (
      <div className="bg-card border-destructive/50 flex flex-col gap-3 rounded-xl border p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm leading-snug font-semibold">{title}</h3>
          <button
            onClick={() => removeJob(jobId)}
            className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">{typeBadge}</div>

        <p className="text-destructive mt-auto flex items-center gap-1.5 text-xs font-medium">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error ?? 'Generation failed'}
        </p>
      </div>
    )
  }

  if (status === 'uploading') {
    return (
      <div className="bg-card border-primary/40 relative flex flex-col gap-3 overflow-hidden rounded-xl border p-4">
        <div className="absolute inset-x-0 top-0 h-0.5">
          <div className="bg-primary/40 h-full w-full animate-pulse" />
        </div>

        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm leading-snug font-semibold">{title}</h3>
          <Upload className="text-primary mt-0.5 h-4 w-4 shrink-0 animate-pulse" />
        </div>

        <div className="flex items-center gap-2">{typeBadge}</div>

        <p className="text-primary/60 mt-auto flex items-center gap-1.5 text-xs">
          Uploading
          <span className="flex gap-0.5">
            <span className="bg-primary/40 h-1 w-1 animate-bounce rounded-full [animation-delay:-0.3s]" />
            <span className="bg-primary/70 h-1 w-1 animate-bounce rounded-full [animation-delay:-0.15s]" />
            <span className="bg-primary h-1 w-1 animate-bounce rounded-full" />
          </span>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card border-primary/40 relative flex flex-col gap-3 overflow-hidden rounded-xl border p-4">
      <div className="absolute inset-x-0 top-0 h-0.5">
        <div className="bg-primary/40 h-full w-full animate-pulse" />
      </div>

      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold">{title}</h3>
        <Sparkles className="text-primary mt-0.5 h-4 w-4 shrink-0 animate-pulse" />
      </div>

      <div className="flex items-center gap-2">{typeBadge}</div>

      <p className="text-primary/60 mt-auto flex items-center gap-1.5 text-xs">
        Generating
        <span className="flex gap-0.5">
          <span className="bg-primary/40 h-1 w-1 animate-bounce rounded-full [animation-delay:-0.3s]" />
          <span className="bg-primary/70 h-1 w-1 animate-bounce rounded-full [animation-delay:-0.15s]" />
          <span className="bg-primary h-1 w-1 animate-bounce rounded-full" />
        </span>
      </p>
    </div>
  )
}
