/* eslint-disable @typescript-eslint/no-unused-vars */
import FileUpload from '@/components/form/file-upload'
import { useModal } from '@/hooks/useModal'
import { usePost } from '@/hooks/usePost'
import { useForm } from 'react-hook-form'
import { QUIZ_ADD } from '@/constants/api-endpoints'
import FormInput from '@/components/form/input'
import { FormSelect } from '@/components/form/form-select'
import { questionTypes } from '@/components/main/quizzes/utils'
import { FormCheckbox } from '@/components/form/form-checkbox'
import FormTextarea from '@/components/form/textarea'
import Button from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from '@/lib/toast'

type QuizFormValues = {
  title: string
  type: string
  isTimerEnabled: boolean
  timerDuration?: number
  file: File
  userInstructions?: string
}

export default function QuizForm() {
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = useState(false)
  const form = useForm<QuizFormValues>({
    defaultValues: {
      title: '',
      type: 'multiple_choice',
      isTimerEnabled: false,
      userInstructions: '',
    },
  })

  const { closeModal } = useModal('quiz-add')
  const { handleSubmit, reset, control } = form

  function onSuccess() {
    queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    closeModal()
    reset()
  }

  const { mutate, isPending } = usePost({
    onSuccess,
  })

  const onSubmit = async (values: QuizFormValues) => {
    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append('file', values.file)

      const uploadResponse = await fetch('http://localhost:3000/upload-file', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const uploadData = await uploadResponse.json()

      const fileKey = uploadData.data[0].key
      const quizPayload = {
        key: fileKey,
        title: values.title,
        type: values.type,
        userInstructions: values.userInstructions || undefined,
        isTimerEnabled: values.isTimerEnabled,
        timerDuration: values.isTimerEnabled ? (values.timerDuration || 0) * 60 : undefined,
      }

      mutate(QUIZ_ADD, quizPayload)
    } catch (error) {
      toast.error('Error in quiz generation:')
    } finally {
      setIsUploading(false)
    }
  }

  const timer = form.watch('isTimerEnabled')
  const isSubmitting = isPending || isUploading

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

      <FileUpload
        label="Upload Source File"
        control={control}
        name="file"
        required
        dropAccept={['PDF', 'DOC', 'DOCX', 'TXT', 'MD']}
      />

      <FormTextarea
        label="Instructions"
        methods={form}
        name="userInstructions"
        placeholder="Enter instructions for quiz takers (optional)"
      />

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          {isUploading ? 'Uploading...' : isPending ? 'Generating Quiz...' : 'Generate Quiz'}
        </Button>
      </div>
    </form>
  )
}
