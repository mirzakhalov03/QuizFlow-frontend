import { create } from 'zustand'
import { userService } from '../api/services/user.service'

type User = {
  id: string
  email: string
  fullName: string
}

type AuthState = {
  user: User | null
  isAuthed: boolean
  isLoading: boolean

  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void

  updateUser: (data: { fullName?: string }) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthed: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthed: !!user,
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  updateUser: async (data) => {
    
      const updated = await userService.updateMe(data)

      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              fullName: updated.fullName,
            }
          : state.user,
      }))
   
  },
}))
