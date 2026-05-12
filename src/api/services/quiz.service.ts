import { api } from '@/api/axios-instance'

type PresignedUrlResult = {
  key: string
  uploadUrl: string
  objectUrl: string
  expiresAt: string
}

const getMimeType = (file: File): string => {
  if (file.type) return file.type
  const ext = file.name.split('.').pop()?.toLowerCase()
  const types: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    md: 'text/markdown',
  }
  return types[ext ?? ''] ?? 'application/octet-stream'
}

export const quizService = {
  async getPresignedUrl(file: File): Promise<PresignedUrlResult> {
    const contentType = getMimeType(file)
    const { data } = await api.get('/upload/presigned-url', {
      params: { filename: file.name, contentType },
    })
    return data.data
  },

  async uploadToS3(uploadUrl: string, file: File): Promise<void> {
    const contentType = getMimeType(file)
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': contentType },
    })
    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.status}`)
    }
  },
}
