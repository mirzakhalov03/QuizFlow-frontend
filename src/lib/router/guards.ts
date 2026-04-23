import { redirect, type LoaderFunctionArgs } from 'react-router-dom'
import { PATHS } from './path'

const getToken = () => localStorage.getItem('token')

export const requireAuth = ({ request }: LoaderFunctionArgs) => {
  if (!getToken()) {
    const from = new URL(request.url).pathname + new URL(request.url).search
    throw redirect(`${PATHS.auth.login}?from=${encodeURIComponent(from)}`)
  }
  return null
}

export const requireGuest = ({ request }: LoaderFunctionArgs) => {
  if (getToken()) {
    const from = new URL(request.url).searchParams.get('from')
    throw redirect(from && from.startsWith('/app') ? from : PATHS.app.dashboard)
  }
  return null
}
