import { api } from '@/api/axios-instance'
import { getMimeType, uploadToS3 } from '@/api/helpers/fileUpload'

type PresignedUrlResult = {
  key: string
  uploadUrl: string
  objectUrl: string
  expiresAt: string
}

export const quizService = {
  async getPresignedUrl(file: File): Promise<PresignedUrlResult> {
    const { data } = await api.get('/upload/presigned-url', {
      params: { filename: file.name, contentType: getMimeType(file) },
    })
    return data.data
  },

  uploadToS3,
}
