import { create } from 'zustand'

type GlobalStore = {
  dataMap: Record<string, unknown>
  setData: <T>(key: string, value: T) => void
  getData: <T>(key: string) => T | undefined
  clearKey: (key: string) => void
  clearAll: () => void
}

export const useGlobalStore = create<GlobalStore>((set, get) => ({
  dataMap: {},

  setData: (key, value) =>
    set((state) => ({
      dataMap: {
        ...state.dataMap,
        [key]: value,
      },
    })),

  getData: <T,>(key: string): T | undefined => {
    return get().dataMap[key] as T | undefined
  },

  clearKey: (key) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _, ...rest } = state.dataMap
      return { dataMap: rest }
    }),

  clearAll: () => set({ dataMap: {} }),
}))
