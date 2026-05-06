import FileUpload from '@/components/form/file-upload'
import { useModal } from '@/hooks/useModal'
import { usePost } from '@/hooks/usePost'
import { useForm } from 'react-hook-form'
import { QUIZ_ADD } from '@/constants/api-endpoints'
import type { GenerateQuizRequest } from '@/types/quiz'
import FormInput from '@/components/form/input'
import { FormSelect } from '@/components/form/form-select'
import { questionTypes, questionCounts, difficulties } from '@/components/main/quizzes/utils'
import { FormCheckbox } from '@/components/form/form-checkbox'
import FormTextarea from '@/components/form/textarea'
import Button from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'

type QuizFormValues = {
  title: string
  type: string
  questionCount: number
  difficulty: string
  isTimerEnabled: boolean
  timerDuration?: number
  file: File
  userInstructions?: string
}

export default function QuizForm() {
  const queryClient = useQueryClient()
  const form = useForm<QuizFormValues>({
    defaultValues: {
      title: '',
      type: 'multiple_choice',
      questionCount: 10,
      difficulty: 'medium',
      isTimerEnabled: false,
      userInstructions: '',
    },
  })

  const { closeModal } = useModal('quiz-add')
  const { handleSubmit, reset, control } = form

  function onSuccess() {
    queryClient.invalidateQueries({queryKey:[]})
    closeModal()
    reset()
  }

  const { mutate, isPending } = usePost({
    onSuccess,
  })

  const onSubmit = async (values: QuizFormValues) => {
    const presignedResponse = await fetch(
      `/api/upload/presigned-url?filename=${values.file.name}&contentType=${values.file.type}`,
      { credentials: 'include' }
    )
    const { data: presignedData } = await presignedResponse.json()

    await fetch(presignedData.uploadUrl, {
      method: 'PUT',
      body: values.file,
      headers: {
        'Content-Type': values.file.type,
      },
    })

    const quizPayload: GenerateQuizRequest = {
      key: presignedData.key,
      bucket: presignedData.bucket || 'your-bucket-name',
      title: values.title,
      type: values.type,
      questionCount: values.questionCount,
      userInstructions: values.userInstructions,
      isTimerEnabled: values.isTimerEnabled,
      timerDuration: values.isTimerEnabled ? (values.timerDuration || 0) * 60 : undefined,
    }

    mutate(QUIZ_ADD, quizPayload)
  }

  const timer = form.watch('isTimerEnabled')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <FormInput
        name="title"
        methods={form}
        label="Title"
        placeholder="Enter quiz title"
        required
      />

      <FormSelect
        label="Question Type"
        options={questionTypes}
        name="type"
        control={control}
        required
      />

      <FormSelect
        label="Number of Questions"
        options={questionCounts}
        name="questionCount"
        control={control}
        required
      />

      <FormSelect label="Difficulty" options={difficulties} name="difficulty" control={control} />

      <FormCheckbox label="Enable Timer" control={control} name="isTimerEnabled" />

      {timer && (
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

      <FileUpload label="Upload Source File" control={control} name="file" required />

      <FormTextarea
        label="Instructions"
        methods={form}
        name="userInstructions"
        placeholder="Enter instructions for quiz takers (optional)"
      />

      <div className="flex justify-end">
        <Button type="submit" loading={isPending}>
          Generate Quiz
        </Button>
      </div>
    </form>
  )
}
