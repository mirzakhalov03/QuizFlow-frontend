import { api } from '@/api/axios-instance'
import { useAuthStore } from '@/hooks/use-authstore'
import { authEvents } from './AuthEvents'
import { toast } from '@/lib/toast'

export const logout = async (navigate?: (path: string) => void) => {
  const setUser = useAuthStore.getState().setUser
  const setLoading = useAuthStore.getState().setLoading

  try {
    await api.post('/auth/logout')
  } catch {}

  setUser(null)
  setLoading(false)

  authEvents.emit('SESSION_EXPIRED') // optional but keeps system consistent

  if (navigate) {
    toast.success('Logged out successfully.')
    navigate('/')
  }
}
