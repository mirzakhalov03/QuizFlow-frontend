import { useGet } from '@/hooks/useGet'
import { BYOK } from '@/constants/api-endpoints'
import { ByokKey } from '@/types/byok'
import { PaginatedResponse } from '@/types/api'
import { useMemo } from 'react'

export const useByokKeys = () => {
  const { data: byokResponse, isLoading, error } = useGet<PaginatedResponse<ByokKey>>(BYOK)

  const keys = byokResponse?.data?.items || []

  const options = useMemo(() => {
    const items = byokResponse?.data?.items || []
    return items.map((key) => ({
      label: `${key.keyName} (${key.provider})`,
      value: key.id,
    }))
  }, [byokResponse?.data?.items])

  return {
    keys,
    options,
    isLoading,
    error,
  }
}
