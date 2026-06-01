import { useForm, useController } from 'react-hook-form'
import { Settings2, Sparkles, ChevronLeft, X } from 'lucide-react'

import { quizService } from '@/api/services/quiz.service'
import { FormSelect } from '@/components/form/form-select'
import FieldLabel from '@/components/form/form-label'
import FormInput from '@/components/form/input'
import FormTextarea from '@/components/form/textarea'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { toast } from '@/lib/toast'
import type { QuestionType } from '@/types/quiz'
import { questionCounts, questionTypes } from '@/components/main/quizzes/utils'
import { usePendingJobsStore } from '@/store/use-pending-jobs-store'
import { useModal } from '@/hooks/useModal'
import { useNotionPages } from '@/hooks/useNotionPages'

type NotionFormValues = {
  pageIds: string[]
  title: string
  type: QuestionType
  questionCount: string
  userInstructions?: string
}

interface NotionQuizFormProps {
  onBack: () => void
}

export default function NotionQuizForm({ onBack }: NotionQuizFormProps) {
  const { closeModal } = useModal('quiz-add')
  const addJob = usePendingJobsStore((s) => s.addJob)
  const setJobReady = usePendingJobsStore((s) => s.setJobReady)
  const markJobFailed = usePendingJobsStore((s) => s.markJobFailed)

  const { pages, loading, error, refetch } = useNotionPages()

  const form = useForm<NotionFormValues>({
    defaultValues: {
      pageIds: [],
      title: '',
      type: 'multiple_choice',
      questionCount: '5',
      userInstructions: '',
    },
  })

  const { handleSubmit, reset, control } = form
  const { field: pageIdsField } = useController({
    control,
    name: 'pageIds',
    rules: { validate: (v) => v.length > 0 || 'Select at least one page' },
  })

  const onSubmit = (values: NotionFormValues) => {
    const tempId = crypto.randomUUID()

    closeModal()
    reset()
    addJob({ jobId: tempId, title: values.title, type: values.type })
    ;(async () => {
      try {
        const result = await quizService.createQuiz('notion', {
          pageIds: values.pageIds,
          title: values.title,
          type: values.type,
          questionCount: parseInt(values.questionCount, 10),
          userInstructions: values.userInstructions || undefined,
        })

        setJobReady(tempId, result.jobId)
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string; detail?: string } } }
        const message =
          e?.response?.data?.message ??
          e?.response?.data?.detail ??
          (err instanceof Error ? err.message : 'Generation failed. Please try again.')
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
      <div className="space-y-4">
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

  const selectedIds: string[] = pageIdsField.value
  const unselectedPages = pages.filter((p) => !selectedIds.includes(p.id))
  const selectedPages = pages.filter((p) => selectedIds.includes(p.id))

  const removePage = (id: string) => {
    pageIdsField.onChange(selectedIds.filter((pid) => pid !== id))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <FieldLabel required>Add Notion Pages</FieldLabel>
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
        {selectedIds.length === 0 && (
          <p className="text-destructive text-xs">Select at least one page</p>
        )}
      </div>

      <FormInput
        name="title"
        methods={form}
        label="Quiz Title"
        placeholder="e.g. Chapter 5 Review"
        required
      />

      <div className="bg-muted/40 space-y-3 rounded-xl p-3">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
          <Settings2 className="h-3.5 w-3.5" />
          Quiz Settings
        </p>

        <div className="grid grid-cols-2 gap-3">
          <FormSelect
            label="Question Type"
            options={questionTypes}
            name="type"
            control={control}
            required
          />
          <FormSelect
            label="Question Count"
            options={questionCounts}
            name="questionCount"
            control={control}
            required
          />
        </div>
      </div>

      <FormTextarea
        label="Custom Instructions"
        methods={form}
        name="userInstructions"
        placeholder="e.g. Focus on important sections, make questions harder… (optional)"
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          leftIcon={<ChevronLeft size={16} />}
          className="flex-1"
        >
          Back
        </Button>
        <Button type="submit" className="flex-1" rightIcon={<Sparkles className="h-4 w-4" />}>
          Generate Quiz
        </Button>
      </div>
    </form>
  )
}
