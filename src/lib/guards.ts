import { redirect, type LoaderFunctionArgs } from 'react-router-dom'
import { PATHS } from './path'
import { useAuthStore } from '@/store/use-authstore'

export const requireAuth = ({ request }: LoaderFunctionArgs) => {
  const user = useAuthStore.getState().user

  if (!user) {
    const from = new URL(request.url).pathname + new URL(request.url).search

    throw redirect(`${PATHS.auth.login}?from=${encodeURIComponent(from)}`)
  }

  return null
}

export const requireGuest = ({ request }: LoaderFunctionArgs) => {
  const user = useAuthStore.getState().user

  if (user) {
    const from = new URL(request.url).searchParams.get('from')

    throw redirect(from && from.startsWith('/app') ? from : PATHS.app.dashboard)
  }

  return null
}
