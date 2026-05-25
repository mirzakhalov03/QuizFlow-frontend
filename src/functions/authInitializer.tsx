import { useEffect } from 'react'
import { useAuthStore } from '@/store/use-authstore'
import { api } from '@/api/axios-instance'
import { toast } from '@/lib/toast'
import { authEvents } from './AuthEvents'

export const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)

      try {
        const { data } = await api.get('/auth/me')
        const user = data?.user ?? data?.data ?? data
        setUser(user?.id ? user : null)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    authEvents.on(() => {
      setUser(null)
      setLoading(false)
      toast.error('Session expired. Please sign in again.')
    })
  }, [setUser, setLoading])
  return children
}
