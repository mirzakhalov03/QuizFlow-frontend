import { useForm } from 'react-hook-form'
import { Settings2, Sparkles, ChevronLeft } from 'lucide-react'

import { notionService } from '@/api/services/notion.service'
import { FormSelect } from '@/components/form/form-select'
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
  pageId: string
  title: string
  type: QuestionType
  questionCount: string
  userInstructions?: string
}

type NotionQuizFormProps = {
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
      pageId: '',
      title: '',
      type: 'multiple_choice',
      questionCount: '5',
      userInstructions: '',
    },
  })

  const { handleSubmit, reset, control } = form

  const onSubmit = (values: NotionFormValues) => {
    const tempId = crypto.randomUUID()

    closeModal()
    reset()
    addJob({ jobId: tempId, title: values.title, type: values.type })

    ;(async () => {
      try {
        const result = await notionService.createQuizFromPage({
          pageId: values.pageId,
          title: values.title,
          type: values.type,
          questionCount: parseInt(values.questionCount, 10),
          userInstructions: values.userInstructions || undefined,
          isTimerEnabled: false,
          timerDuration: undefined,
        })

        setJobReady(tempId, result.jobId)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Generation failed'
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

  const pageOptions = pages.map((page) => ({
    label: page.icon ? `${page.icon} ${page.title}` : page.title,
    value: page.id,
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <FormSelect
          label="Select Notion Page"
          options={pageOptions}
          name="pageId"
          control={control}
          required
          placeholder="Choose a page..."
        />
        <p className="text-muted-foreground mt-1 text-xs">Select the page to generate quiz from</p>
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
