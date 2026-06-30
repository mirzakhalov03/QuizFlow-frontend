import { create } from 'zustand'

type SidebarState = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))