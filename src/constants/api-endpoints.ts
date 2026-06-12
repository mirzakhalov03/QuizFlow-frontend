export const QUIZ_ADD = '/quizzes'
export const QUIZ_LIST = '/quizzes'
export const QUIZ_BY_ID = (id: string) => `/quizzes/${id}`
export const QUIZ_SHARE_ENABLE = (id: string) => `/quizzes/${id}/share/enable`
export const QUIZ_JOB = (jobId: string) => `/quizzes/jobs/${jobId}`
export const QUIZ_SUBMIT = (id: string) => `/quizzes/${id}/submit`
export const QUIZ_RESULT = (id: string) => `/quizzes/${id}/result`
export const QUIZ_PDF = (id: string) => `/quizzes/${id}/pdf`
export const PRESIGNED_URL = '/upload/presigned-url'

export const PUBLIC_QUIZ_BY_TOKEN = (token: string) => `/public/quizzes/${token}`

export const INTEGRATIONS = '/integrations'
export const INTEGRATION_BY_PROVIDER = (provider: string) => `/integrations/${provider}`

export const BYOK = '/byok'
export const BYOK_BY_ID = (id: string) => `/byok/${id}`

export const ANALYTICS_SUMMARY = '/analytics/summary'
