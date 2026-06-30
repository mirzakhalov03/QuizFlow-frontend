import { useEffect, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { QUIZ_JOB, QUIZ_LIST } from '@/constants/api-endpoints'
import { useGet } from '@/hooks/useGet'
import type { ApiResponse, QuizJob } from '@/types/quiz'

type Options = {
  onDone: () => void
  onFailed: (error?: string) => void
  folderId?: string
}

export const useQuizJobPoller = (
  initialJobId: string | null,
  { onDone, onFailed, folderId }: Options
) => {
  const queryClient = useQueryClient()
  const [jobId, setJobId] = useState<string | null>(initialJobId)

  const onDoneRef = useRef(onDone)
  const onFailedRef = useRef(onFailed)

  useEffect(() => {
    onDoneRef.current = onDone
    onFailedRef.current = onFailed
  }, [onDone, onFailed])

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
    if (!jobId || !jobStatus) return

    if (jobStatus === 'done') {
      queryClient.invalidateQueries({ queryKey: [QUIZ_LIST] })
      if (folderId) {
        queryClient.invalidateQueries({ queryKey: [`/folders/${folderId}/quizzes`] })
      }
      queryClient.invalidateQueries({ queryKey: ['/folders'] })
      queueMicrotask(() => setJobId(null))
      onDoneRef.current()
    } else if (jobStatus === 'failed') {
      queueMicrotask(() => setJobId(null))
      onFailedRef.current(jobError ?? undefined)
    }
  }, [jobStatus, jobError, jobId, queryClient, folderId])

  return { startPolling: setJobId }
}
