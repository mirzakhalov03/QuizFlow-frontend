import { api } from '@/api/axios-instance'
import { getMimeType, uploadToS3 } from '@/api/helpers/fileUpload'
import type { QuestionType } from '@/types/quiz'

type PresignedUrlResult = {
  key: string
  uploadUrl: string
  objectUrl: string
  expiresAt: string
}

type BaseQuizPayload = {
  title?: string
  type?: QuestionType
  questionCount: number
  userInstructions?: string
  isTimerEnabled?: boolean
  timerDuration?: number
  difficulty?: string
  folderId?: string
}

export type FileQuizPayload = BaseQuizPayload & {
  keys: string[]
  model: string
  difficulty: string
  apiKeyId?: string
}

export type NotionQuizPayload = BaseQuizPayload & {
  pageIds: string[]
  model: string
  difficulty: string
  apiKeyId?: string
}

type QuizSource = 'file' | 'notion'
type CreateQuizPayload = FileQuizPayload | NotionQuizPayload
type CreateQuizResult = { jobId: string; pollUrl: string }

export const quizService = {
  async getPresignedUrl(file: File): Promise<PresignedUrlResult> {
    const { data } = await api.get('/upload/presigned-url', {
      params: { filename: file.name, contentType: getMimeType(file) },
    })
    return data.data
  },

  uploadToS3,

  async createQuiz(source: QuizSource, payload: CreateQuizPayload): Promise<CreateQuizResult> {
    const { data } = await api.post('/quizzes', payload, { params: { source } })
    return data.data
  },
}
