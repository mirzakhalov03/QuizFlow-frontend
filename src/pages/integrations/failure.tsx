import { useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'

import { PATHS } from '@/lib/path'
import { toast } from '@/lib/toast'

export default function IntegrationFailure() {
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error') || 'Integration failed'

  useEffect(() => {
    toast.error(error === 'access_denied' ? 'Connection canceled' : error)
  }, [error])

  return <Navigate to={PATHS.app.account} replace />
}
