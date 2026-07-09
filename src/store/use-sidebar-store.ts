import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SidebarState = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
)