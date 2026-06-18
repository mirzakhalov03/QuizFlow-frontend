import { api } from '@/api/axios-instance'
import { useAuthStore } from '@/store/use-authstore'
import { useUserProfileStore } from '@/store/userProfileStore'
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
  // Wipe the cached profile so the next account doesn't inherit this user's avatar/bio.
  useUserProfileStore.getState().reset()

  if (navigate) {
    toast.success('Logged out successfully.')
    navigate('/')
  }
}
