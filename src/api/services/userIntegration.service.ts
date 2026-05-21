import { api } from '@/api/axios-instance'
import type { IntegrationProvider } from '@/types/integration'

export const userIntegrationService = {
  startConnect(provider: IntegrationProvider) {
    const baseURL = api.defaults.baseURL?.replace(/\/$/, '') ?? ''
    window.location.href = `${baseURL}/auth/${provider}`
  },
}
