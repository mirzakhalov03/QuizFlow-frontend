import { useEffect, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { quizService } from '@/api/services/quiz.service'
import FileUpload from '@/components/form/file-upload'
import { FormCheckbox } from '@/components/form/form-checkbox'
import FormInput from '@/components/form/input'
import { FormSelect } from '@/components/form/form-select'
import FormTextarea from '@/components/form/textarea'
import Button from '@/components/ui/button'
import { QUIZ_ADD, QUIZ_JOB, QUIZ_LIST } from '@/constants/api-endpoints'
import { useGet } from '@/hooks/useGet'
import { useModal } from '@/hooks/useModal'
import { usePost } from '@/hooks/usePost'
import { toast } from '@/lib/toast'
import type { ApiResponse, QuizJob } from '@/types/quiz'
import { questionCounts, questionTypes } from '@/components/main/quizzes/utils'

type QuizFormValues = {
  title: string
  type: string
  questionCount: string
  isTimerEnabled: boolean
  timerDuration?: number
  file: File
  userInstructions?: string
}

type GenerateQuizResponse = ApiResponse<{ jobId: string; pollUrl: string }>

export default function QuizForm() {
  const queryClient = useQueryClient()
  const { closeModal } = useModal('quiz-add')

  const [phase, setPhase] = useState<'form' | 'uploading' | 'polling'>('form')
  const [jobId, setJobId] = useState<string | null>(null)

  const form = useForm<QuizFormValues>({
    defaultValues: {
      title: '',
      type: 'multiple_choice',
      questionCount: '5',
      isTimerEnabled: false,
      userInstructions: '',
    },
  })

  const { handleSubmit, reset, control, watch } = form
  const timerEnabled = watch('isTimerEnabled')

  // ── Job polling ────────────────────────────────────────────────────────────
  const { data: jobData } = useGet<ApiResponse<QuizJob>>(QUIZ_JOB(jobId ?? '_'), {
    enabled: !!jobId,
    options: {
      refetchInterval: 2000,
      staleTime: 0,
    },
  })

  const jobStatus = jobData?.data?.status

  const jobError = jobData?.data?.error

  useEffect(() => {
    if (!jobStatus) return

    if (jobStatus === 'done') {
      queryClient.invalidateQueries({ queryKey: [QUIZ_LIST] })
      toast.success('Quiz generated successfully!')
      closeModal()
      reset()
      setJobId(null)
      setPhase('form')
    } else if (jobStatus === 'failed') {
      toast.error(jobError ?? 'Quiz generation failed. Please try again.')
      setJobId(null)
      setPhase('form')
    }
  }, [jobStatus, jobError, queryClient, closeModal, reset])

  // ── Quiz generation mutation ───────────────────────────────────────────────
  const { mutate: generateQuiz } = usePost<GenerateQuizResponse['data'], GenerateQuizResponse>({
    onSuccess: (res) => {
      setJobId(res.data.jobId)
      setPhase('polling')
    },
    onError: () => {
      setPhase('form')
    },
  })

  // ── Submit handler ─────────────────────────────────────────────────────────
  const onSubmit = async (values: QuizFormValues) => {
    try {
      setPhase('uploading')

      // 1. Get presigned URL
      const { uploadUrl, key } = await quizService.getPresignedUrl(values.file)

      // 2. Upload directly to S3
      await quizService.uploadToS3(uploadUrl, values.file)

      // 3. Kick off Lambda via backend
      generateQuiz(QUIZ_ADD, {
        key,
        title: values.title,
        type: values.type,
        questionCount: parseInt(values.questionCount, 10),
        userInstructions: values.userInstructions || undefined,
        isTimerEnabled: values.isTimerEnabled,
        timerDuration: values.isTimerEnabled ? (values.timerDuration ?? 0) * 60 : undefined,
      })
    } catch {
      toast.error('Upload failed. Please try again.')
      setPhase('form')
    }
  }

  // ── Polling / uploading state ──────────────────────────────────────────────
  if (phase !== 'form') {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
        <p className="text-sm font-medium">
          {phase === 'uploading' ? 'Uploading file…' : 'Generating your quiz…'}
        </p>
        <p className="text-muted-foreground text-xs">
          {phase === 'uploading'
            ? 'Sending your file to the cloud'
            : 'This usually takes 30–60 seconds'}
        </p>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <FormInput
        name="title"
        methods={form}
        label="Title"
        placeholder="Enter quiz title"
        required
      />

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

      <FileUpload
        label="Upload Source File"
        control={control}
        name="file"
        required
        dropAccept={['PDF', 'DOC', 'DOCX', 'TXT', 'MD']}
      />

      <FormTextarea
        label="Custom Instructions"
        methods={form}
        name="userInstructions"
        placeholder="e.g. Focus on chapter 3, make questions harder, only ask about dates… (optional)"
      />

      <div className="flex justify-end">
        <Button type="submit">Generate Quiz</Button>
      </div>
    </form>
  )
}
