import { api } from '@/api/axios-instance'
import { useAuthStore } from '@/store/use-authstore'
import { toast } from '@/lib/toast'

export const logout = async (navigate?: (path: string) => void) => {
  const setUser = useAuthStore.getState().setUser
  const setLoading = useAuthStore.getState().setLoading

  try {
    await api.post('/auth/logout')
  } catch (error) {
    console.error('Logout failed:', error)
  }

  // Clear auth state directly. We intentionally do NOT emit SESSION_EXPIRED here —
  // that event surfaces an error toast meant for involuntary session loss.
  setUser(null)
  setLoading(false)

  if (navigate) {
    toast.success('Logged out successfully.')
    navigate('/')
  }
}
