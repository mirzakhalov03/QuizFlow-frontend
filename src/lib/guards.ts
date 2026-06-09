import { redirect, type LoaderFunctionArgs } from 'react-router-dom'
import { PATHS } from './path'
import { useAuthStore } from '@/store/use-authstore'

const waitForAuthReady = (): Promise<void> =>
  new Promise((resolve) => {
    if (!useAuthStore.getState().isLoading) {
      resolve()
      return
    }
    const unsub = useAuthStore.subscribe((state) => {
      if (!state.isLoading) {
        unsub()
        resolve()
      }
    })
  })

export const requireAuth = async ({ request }: LoaderFunctionArgs) => {
  await waitForAuthReady()
  const user = useAuthStore.getState().user

  if (!user) {
    const from = new URL(request.url).pathname + new URL(request.url).search
    throw redirect(`${PATHS.auth.login}?from=${encodeURIComponent(from)}`)
  }

  return null
}

export const requireGuest = async ({ request }: LoaderFunctionArgs) => {
  await waitForAuthReady()
  const user = useAuthStore.getState().user

  if (user) {
    const from = new URL(request.url).searchParams.get('from')
    throw redirect(from && from.startsWith('/app') ? from : PATHS.app.quizzes)
  }

  return null
}
