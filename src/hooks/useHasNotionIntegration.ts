import { useEffect, useState } from 'react'
import { api } from '@/api/axios-instance'
import { INTEGRATIONS } from '@/constants/api-endpoints'
import type { Integration } from '@/types/integration'

export const useHasNotionIntegration = () => {
  const [hasIntegration, setHasIntegration] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<Integration[]>(INTEGRATIONS)
      .then(({ data }) => {
        setHasIntegration(data.some((i) => i.provider === 'notion'))
      })
      .catch(() => setHasIntegration(false))
      .finally(() => setLoading(false))
  }, [])

  return { hasIntegration, loading }
}
