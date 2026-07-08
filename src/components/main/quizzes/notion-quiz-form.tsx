import { useForm, useController } from 'react-hook-form'
import { ChevronLeft, X } from 'lucide-react'

import { quizService } from '@/api/services/quiz.service'
import FieldLabel from '@/components/form/form-label'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { toast } from '@/lib/toast'
import { extractApiErrorMessage } from '@/lib/api-error'
import {
  DEFAULT_MODEL,
  toTimerSeconds,
  type QuizSettingsValues,
} from '@/components/main/quizzes/utils'
import QuizSettingsFields from '@/components/main/quizzes/quiz-settings-fields'
import { usePendingJobsStore } from '@/store/use-pending-jobs-store'
import { useModal } from '@/hooks/useModal'
import { useNotionPages } from '@/hooks/useNotionPages'

type NotionFormValues = QuizSettingsValues & {
  pageIds: string[]
}

type NotionQuizFormProps = {
  onBack: () => void
  folderId?: string
}

export default function NotionQuizForm({ onBack, folderId }: NotionQuizFormProps) {
  const { closeModal } = useModal('quiz-add')
  const addJob = usePendingJobsStore((s) => s.addJob)
  const setJobReady = usePendingJobsStore((s) => s.setJobReady)
  const markJobFailed = usePendingJobsStore((s) => s.markJobFailed)

  const { pages, loading, error, refetch } = useNotionPages()

  const form = useForm<NotionFormValues>({
    defaultValues: {
      pageIds: [],
      type: 'multiple_choice',
      questionCount: '5',
      difficulty: 'medium',
      model: DEFAULT_MODEL,
      apiKeyId: '',
      isTimerEnabled: false,
      optionsPerQuestion: 4,
      userInstructions: '',
      folderId: folderId || 'none',
      avoidQuizIds: [],
    },
  })

  const { handleSubmit, reset, control } = form
  const { field: pageIdsField, fieldState } = useController({
    control,
    name: 'pageIds',
    rules: { validate: (v) => v.length > 0 || 'Select at least one page' },
  })

  const onSubmit = (values: NotionFormValues) => {
    const tempId = crypto.randomUUID()
    const targetFolderId = values.folderId !== 'none' ? values.folderId : undefined

    closeModal()
    reset()
    addJob({
      jobId: tempId,
      title: 'Generating quiz…',
      type: values.type,
      folderId: targetFolderId,
    })
    ;(async () => {
      try {
        const result = await quizService.createQuiz('notion', {
          pageIds: values.pageIds,
          type: values.type,
          questionCount: parseInt(values.questionCount, 10),
          userInstructions: values.userInstructions || undefined,
          folderId: values.folderId !== 'none' ? values.folderId : undefined,
          difficulty: values.difficulty,
          isTimerEnabled: values.isTimerEnabled,
          timerDuration: toTimerSeconds(values.isTimerEnabled, values.timerDuration),
          model: values.model,
          apiKeyId: values.apiKeyId || undefined,
          optionsPerQuestion: values.optionsPerQuestion,
          avoidQuizIds:
            values.avoidQuizIds && values.avoidQuizIds.length > 0 ? values.avoidQuizIds : undefined,
        })

        setJobReady(tempId, result.jobId)
      } catch (err: unknown) {
        const message = extractApiErrorMessage(err)
        markJobFailed(tempId, message)
        toast.error(message)
      }
    })()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 pb-4 sm:pb-6">
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">{error}</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} leftIcon={<ChevronLeft size={16} />}>
            Back
          </Button>
          <Button onClick={refetch} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const selectedIds: string[] = pageIdsField.value ?? []
  const unselectedPages = pages.filter((p) => !selectedIds.includes(p.id))
  const selectedPages = pages.filter((p) => selectedIds.includes(p.id))

  const removePage = (id: string) => {
    pageIdsField.onChange(selectedIds.filter((pid) => pid !== id))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <FieldLabel required isError={!!fieldState.error}>
          Add Notion Pages
        </FieldLabel>
        <select
          className="border-border bg-background focus:ring-primary/40 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:opacity-50"
          value=""
          disabled={unselectedPages.length === 0}
          onChange={(e) => {
            const id = e.target.value
            if (id) pageIdsField.onChange([...selectedIds, id])
          }}
        >
          <option value="" disabled>
            {unselectedPages.length ? 'Choose a page…' : 'All pages selected'}
          </option>
          {unselectedPages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.icon ? `${p.icon} ${p.title}` : p.title}
            </option>
          ))}
        </select>
        {selectedPages.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedPages.map((p) => (
              <span
                key={p.id}
                className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
              >
                {p.icon && <span>{p.icon}</span>}
                {p.title}
                <button
                  type="button"
                  onClick={() => removePage(p.id)}
                  className="hover:text-primary/70 ml-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        {fieldState.error && <p className="text-destructive text-xs">{fieldState.error.message}</p>}
      </div>

      <QuizSettingsFields form={form} onBack={onBack} folderId={folderId} />
    </form>
  )
}
