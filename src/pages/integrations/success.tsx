import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { INTEGRATIONS } from '@/constants/api-endpoints'
import { PATHS } from '@/lib/path'
import { toast } from '@/lib/toast'

export default function IntegrationSuccess() {
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: [INTEGRATIONS] })
    toast.success('Integration connected')
  }, [queryClient])

  return <Navigate to={PATHS.app.account} replace />
}
