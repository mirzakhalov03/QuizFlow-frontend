import { useGet } from '@/hooks/useGet'
import { INTEGRATIONS } from '@/constants/api-endpoints'
import type { Integration } from '@/types/integration'
import type { ApiResponse } from '@/types/api'

export const useHasNotionIntegration = () => {
  const { data, isLoading } = useGet<ApiResponse<{ integrations: Integration[] }>>(INTEGRATIONS)

  const integrations = data?.data?.integrations

  return {
    hasIntegration: Array.isArray(integrations)
      ? integrations.some((i) => i.provider === 'notion')
      : false,
    loading: isLoading,
  }
}
