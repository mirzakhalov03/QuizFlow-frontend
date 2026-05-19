import { useForm, useWatch } from 'react-hook-form'
import { Settings2, Sparkles } from 'lucide-react'

import { quizService } from '@/api/services/quiz.service'
import { postRequest } from '@/hooks/usePost'
import FileUpload from '@/components/form/file-upload'
import { FormCheckbox } from '@/components/form/form-checkbox'
import FormInput from '@/components/form/input'
import { FormSelect } from '@/components/form/form-select'
import FormTextarea from '@/components/form/textarea'
import Button from '@/components/ui/button'
import { QUIZ_ADD } from '@/constants/api-endpoints'
import { useModal } from '@/hooks/useModal'
import { toast } from '@/lib/toast'
import type { ApiResponse, QuestionType } from '@/types/quiz'
import { aiModels, questionCounts, questionTypes } from '@/components/main/quizzes/utils'
import { usePendingJobsStore } from '@/store/use-pending-jobs-store'

type QuizFormValues = {
  title: string
  type: QuestionType
  questionCount: string
  isTimerEnabled: boolean
  timerDuration?: number
  file: File
  userInstructions?: string
  model: string
}

type GenerateQuizResponse = ApiResponse<{ jobId: string; pollUrl: string }>

type GenerateQuizPayload = {
  key: string
  title: string
  type: QuestionType
  questionCount: number
  userInstructions?: string
  isTimerEnabled: boolean
  timerDuration?: number
  model: string
}

export default function QuizForm() {
  const { closeModal } = useModal('quiz-add')
  const addJob = usePendingJobsStore((s) => s.addJob)
  const setJobReady = usePendingJobsStore((s) => s.setJobReady)
  const markJobFailed = usePendingJobsStore((s) => s.markJobFailed)

  const form = useForm<QuizFormValues>({
    defaultValues: {
      title: '',
      type: 'multiple_choice',
      questionCount: '5',
      isTimerEnabled: false,
      userInstructions: '',
      model: 'google/gemini-2.0-flash-001',
    },
  })

  const { handleSubmit, reset, control } = form
  const timerEnabled = useWatch({ control, name: 'isTimerEnabled' }) ?? false

  const onSubmit = (values: QuizFormValues) => {
    const tempId = crypto.randomUUID()

    closeModal()
    reset()
    addJob({ jobId: tempId, title: values.title, type: values.type })
    ;(async () => {
      try {
        const { uploadUrl, key } = await quizService.getPresignedUrl(values.file)
        await quizService.uploadToS3(uploadUrl, values.file)

        const res: GenerateQuizResponse = await postRequest<GenerateQuizPayload>(QUIZ_ADD, {
          key,
          title: values.title,
          type: values.type,
          questionCount: parseInt(values.questionCount, 10),
          userInstructions: values.userInstructions || undefined,
          isTimerEnabled: values.isTimerEnabled,
          timerDuration: values.isTimerEnabled ? (values.timerDuration ?? 0) * 60 : undefined,
          model: values.model,
        })

        setJobReady(tempId, res.data.jobId)
      } catch {
        markJobFailed(tempId, 'Generation failed. Please try again.')
        toast.error('Quiz generation failed. Please try again.')
      }
    })()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        name="title"
        methods={form}
        label="Quiz Title"
        placeholder="e.g. Chapter 5 Review"
        required
      />

      <div className="space-y-1">
        <FileUpload
          label="Source Document"
          control={control}
          name="file"
          required
          maxSize={25}
          hideError={false}
          dropAccept={['PDF', 'DOC', 'DOCX', 'TXT', 'MD']}
        />
        <p className="text-muted-foreground text-xs">PDF, Word, TXT or Markdown · max 25 MB</p>
      </div>

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

        <FormSelect label="AI Model" options={aiModels} name="model" control={control} required />

        <FormCheckbox label="Enable Timer" control={control} name="isTimerEnabled" />

        {timerEnabled && (
          <FormInput
            name="timerDuration"
            methods={form}
            label="Timer (minutes)"
            type="number"
            registerOptions={{
              min: { value: 1, message: 'Minimum 1 minute' },
              max: { value: 180, message: 'Maximum 180 minutes' },
              valueAsNumber: true,
            }}
            required
          />
        )}
      </div>

      <FormTextarea
        label="Custom Instructions"
        methods={form}
        name="userInstructions"
        placeholder="e.g. Focus on chapter 3, make questions harder, only ask about dates… (optional)"
      />

      <Button type="submit" className="w-full" rightIcon={<Sparkles className="h-4 w-4" />}>
        Generate Quiz
      </Button>
    </form>
  )
}
