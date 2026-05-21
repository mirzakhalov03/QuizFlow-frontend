export const getMimeType = (file: File): string => {
  if (file.type) return file.type
  const ext = file.name.split('.').pop()?.toLowerCase()
  const types: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    md: 'text/markdown',
  }
  return types[ext ?? ''] ?? 'application/octet-stream'
}

export const uploadToS3 = async (uploadUrl: string, file: File): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': getMimeType(file) },
  })
  if (!response.ok) throw new Error(`S3 upload failed: ${response.status}`)
}
