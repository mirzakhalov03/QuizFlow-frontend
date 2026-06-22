import { useForm } from 'react-hook-form'

import { quizService } from '@/api/services/quiz.service'
import FileUpload from '@/components/form/file-upload'
import { useModal } from '@/hooks/useModal'
import { toast } from '@/lib/toast'
import { extractApiErrorMessage } from '@/lib/api-error'
import {
  DEFAULT_MODEL,
  toTimerSeconds,
  type QuizSettingsValues,
} from '@/components/main/quizzes/utils'
import QuizSettingsFields from '@/components/main/quizzes/quiz-settings-fields'
import { usePendingJobsStore } from '@/store/use-pending-jobs-store'

type QuizFormValues = QuizSettingsValues & {
  files: File[]
}

interface QuizFormProps {
  onBack: () => void
  folderId?: string
}

export default function QuizForm({ onBack, folderId }: QuizFormProps) {
  const { closeModal } = useModal('quiz-add')
  const addJob = usePendingJobsStore((s) => s.addJob)
  const setJobReady = usePendingJobsStore((s) => s.setJobReady)
  const markJobFailed = usePendingJobsStore((s) => s.markJobFailed)

  const form = useForm<QuizFormValues>({
    defaultValues: {
      type: 'multiple_choice',
      questionCount: '5',
      difficulty: 'medium',
      isTimerEnabled: false,
      userInstructions: '',
      model: DEFAULT_MODEL,
      folderId: folderId || 'none',
      apiKeyId: '',
    },
  })

  const { handleSubmit, reset } = form

  const onSubmit = (values: QuizFormValues) => {
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
        const keys = await Promise.all(
          values.files.map(async (file) => {
            const { uploadUrl, key } = await quizService.getPresignedUrl(file)
            await quizService.uploadToS3(uploadUrl, file)
            return key
          })
        )

        const result = await quizService.createQuiz('file', {
          keys,
          type: values.type,
          questionCount: parseInt(values.questionCount, 10),
          userInstructions: values.userInstructions || undefined,
          difficulty: values.difficulty,
          isTimerEnabled: values.isTimerEnabled,
          timerDuration: toTimerSeconds(values.isTimerEnabled, values.timerDuration),
          model: values.model,
          apiKeyId: values.apiKeyId || undefined,
          folderId: values.folderId !== 'none' ? values.folderId : undefined,
        })

        setJobReady(tempId, result.jobId)
      } catch (err: unknown) {
        const message = extractApiErrorMessage(err)
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
          control={form.control}
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

      <QuizSettingsFields form={form} onBack={onBack} folderId={folderId} />
    </form>
  )
}
