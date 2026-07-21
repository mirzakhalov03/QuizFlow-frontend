import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PATHS } from '@/lib/path'
import { toast } from '@/lib/toast'
export default function IntegrationFailure() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const error = searchParams.get('error') || 'Integration failed'
  useEffect(() => {
    toast.error(error === 'access_denied' ? 'Connection canceled' : error)
    navigate(`${PATHS.app.account}?tab=integrations`, { replace: true })
  }, [error, navigate])
  return null
}
