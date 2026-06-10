import { UseFormReturn, FieldValues } from 'react-hook-form'
import { toast } from '@/lib/toast'

type ApiError = {
  status?: number
  response?: {
    data?: Record<string, string>
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleFormError<T extends FieldValues = any>(
  err: ApiError | unknown,
  form?: UseFormReturn<T>
) {
  const error = err as ApiError
  const isClientError = Number(error?.status) >= 400 && Number(error?.status) < 500
  const data = error?.response?.data || {}
  const msg = data?.detail

  let hasValidFieldError = false

  if (form && isClientError) {
    const fields = form.getValues()

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'detail') {
        const isFieldExist = key in fields || key.includes('.')
        if (isFieldExist) {
          hasValidFieldError = true
          if (value) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            form.setError(key as any, {
              type: 'validate',
              message: value as string,
            })
          }
        }
      }
    }

    if (!hasValidFieldError && msg) {
      toast.error(msg)
    }
  } else if (isClientError && msg) {
    const arrayErrors = Object.entries(data).filter(([key]) => key !== 'detail')
    if (arrayErrors.length > 0) {
      toast.error(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        arrayErrors.map(([_, value]) => String(value)).join('\n'),
        {
          duration: 5000,
        }
      )
    }
  } else {
    toast.error('Something went wrong please try again')
  }
}

export function showMsgError(err: ApiError | unknown) {
  const error = err as ApiError
  const data = error?.response?.data || {}
  const msg = data?.detail

  if (msg) {
    toast.error(msg)
  }
}
