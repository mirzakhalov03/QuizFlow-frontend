import { createContext, useContext, useEffect, useState } from 'react'
import setGlobalColorTheme, { themes } from '@/lib/theme-color'
import { useTheme } from './theme'

const ThemeContext = createContext<ThemeColorStateParams>({} as ThemeColorStateParams)

export default function ThemeDataProvider({ children }: { children: React.ReactNode }) {
  const getSavedThemeColor = (): ThemeColors => {
    try {
      const saved = localStorage.getItem('themeColor') as ThemeColors | null
      if (saved && saved in themes) {
        return saved
      }
      return 'Telegram'
    } catch {
      return 'Telegram'
    }
  }

  const [themeColor, setThemeColor] = useState<ThemeColors>(getSavedThemeColor)
  const { theme } = useTheme()

  useEffect(() => {
    localStorage.setItem('themeColor', themeColor)
    const resolved =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme
    setGlobalColorTheme(resolved as 'light' | 'dark', themeColor)
  }, [themeColor, theme])

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>{children}</ThemeContext.Provider>
  )
}

export function useThemeContext() {
  return useContext(ThemeContext)
}
