import { useGet } from '@/hooks/useGet'
import { INTEGRATIONS } from '@/constants/api-endpoints'
import type { Integration } from '@/types/integration'

export const useHasNotionIntegration = () => {
  const { data, isLoading } = useGet<Integration[]>(INTEGRATIONS)

  return {
    hasIntegration: data?.some((i) => i.provider === 'notion') ?? false,
    loading: isLoading,
  }
}
