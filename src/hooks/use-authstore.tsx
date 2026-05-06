import { create } from 'zustand'

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
}))
