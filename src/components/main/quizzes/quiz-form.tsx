import { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Settings2, Sparkles, ChevronLeft } from 'lucide-react'

import { quizService } from '@/api/services/quiz.service'
import FileUpload from '@/components/form/file-upload'
import { FormCheckbox } from '@/components/form/form-checkbox'
import FormInput from '@/components/form/input'
import { FormSelect } from '@/components/form/form-select'
import FormTextarea from '@/components/form/textarea'
import Button from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
import { useByokKeys } from '@/hooks/useByokKeys'
import { toast } from '@/lib/toast'
import type { QuestionType } from '@/types/quiz'
import {
  aiModels,
  buildByokOptionValue,
  DEFAULT_MODEL,
  difficulties,
  parseModelSelection,
  questionCounts,
  questionTypes,
} from '@/components/main/quizzes/utils'
import { usePendingJobsStore } from '@/store/use-pending-jobs-store'

type QuizFormValues = {
  type: QuestionType
  questionCount: string
  difficulty: string
  isTimerEnabled: boolean
  timerDuration?: number
  files: File[]
  userInstructions?: string
  model: string
}

interface QuizFormProps {
  onBack: () => void
}

export default function QuizForm({ onBack }: QuizFormProps) {
  const { closeModal } = useModal('quiz-add')
  const addJob = usePendingJobsStore((s) => s.addJob)
  const setJobReady = usePendingJobsStore((s) => s.setJobReady)
  const markJobFailed = usePendingJobsStore((s) => s.markJobFailed)

  const { keys: byokKeys } = useByokKeys()

  const form = useForm<QuizFormValues>({
    defaultValues: {
      type: 'multiple_choice',
      questionCount: '5',
      difficulty: 'medium',
      isTimerEnabled: false,
      userInstructions: '',
      model: DEFAULT_MODEL,
    },
  })

  const { handleSubmit, reset, control, setValue, getValues } = form
  const timerEnabled = useWatch({ control, name: 'isTimerEnabled' }) ?? false

  // Surface the user's BYOK keys as a separate group above the built-in models.
  const modelOptions = useMemo<{ label: string; value: string; group?: string }[]>(() => {
    if (byokKeys.length === 0) return aiModels
    return [
      ...byokKeys.map((key) => ({
        label: `${key.keyName} (${key.provider})`,
        value: buildByokOptionValue(key.id),
        group: 'Your Keys (BYOK)',
      })),
      ...aiModels.map((model) => ({ ...model, group: 'Models' })),
    ]
  }, [byokKeys])

  // Default to the user's first key when they have one, but never override a
  // manual change.
  const byokDefaultApplied = useRef(false)
  useEffect(() => {
    if (!byokDefaultApplied.current && byokKeys.length > 0) {
      // Don't clobber a manual change made while the keys were still loading.
      if (getValues('model') === DEFAULT_MODEL) {
        setValue('model', buildByokOptionValue(byokKeys[0].id))
      }
      byokDefaultApplied.current = true
    }
  }, [byokKeys, setValue, getValues])

  const onSubmit = (values: QuizFormValues) => {
    const tempId = crypto.randomUUID()
    const { model, apiKeyId } = parseModelSelection(values.model)

    closeModal()
    reset()
    addJob({ jobId: tempId, title: 'Generating quiz…', type: values.type })
    ;(async () => {
      try {
        const keys = await Promise.all(
          values.files.map(async (file) => {
            const { uploadUrl, key } = await quizService.getPresignedUrl(file)
            await quizService.uploadToS3(uploadUrl, file)
            return key
          })
        )

        const result = await quizService.createQuiz('file', {
          keys,
          type: values.type === 'mixed' ? undefined : values.type,
          questionCount: parseInt(values.questionCount, 10),
          userInstructions: values.userInstructions || undefined,
          difficulty: values.difficulty,
          isTimerEnabled: values.isTimerEnabled,
          timerDuration: values.isTimerEnabled ? (values.timerDuration ?? 0) * 60 : undefined,
          model,
          apiKeyId,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <FileUpload
          label="Source Documents"
          control={control}
          name="files"
          required
          multiple
          isPaste={false}
          maxSize={25}
          maxLength={5}
          hideError={false}
          dropAccept={['PDF', 'DOC', 'DOCX', 'TXT', 'MD', 'PPTX']}
        />
        <p className="text-muted-foreground text-xs">
          PDF, Word, PPTX, TXT or Markdown · max 25 MB · up to 5 files
        </p>
      </div>

      <div className="bg-muted/40 space-y-3 rounded-xl p-3">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
          <Settings2 className="h-3.5 w-3.5" />
          Quiz Settings
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormSelect
            label="Difficulty"
            options={difficulties}
            name="difficulty"
            control={control}
            required
          />
          <FormSelect
            label="AI Model"
            options={modelOptions}
            groupKey="group"
            name="model"
            control={control}
            required
          />
        </div>

        <FormCheckbox label="Enable Timer" control={control} name="isTimerEnabled" />

        {timerEnabled && (
          <FormInput
            name="timerDuration"
            methods={form}
            label="Timer (minutes)"
            type="number"
            min={1}
            onKeyDown={(e) => {
              if (['-', 'e', 'E', '+'].includes(e.key)) {
                e.preventDefault()
              }
            }}
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
        placeholder="e.g. Focus on chapter 3, only ask about dates… (optional)"
      />

      <div className="sticky bottom-0 z-10 -mx-4 flex gap-2 border-t border-gray-200 bg-white px-4 pt-4 pb-4 sm:-mx-6 sm:px-6 sm:pb-6 dark:border-gray-700 dark:bg-gray-800">
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
