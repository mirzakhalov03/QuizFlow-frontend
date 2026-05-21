import { API_URL } from '@/lib/config'
import type { IntegrationProvider } from '@/types/integration'

export const userIntegrationService = {
  startConnect(provider: IntegrationProvider) {
    window.location.href = `${API_URL}/auth/${provider}`
  },
}
