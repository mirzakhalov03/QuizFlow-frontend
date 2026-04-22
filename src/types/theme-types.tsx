type ThemeColors = 'Telegram' | 'Green' | 'Violet'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ThemeColorStateParams {
  themeColor: ThemeColors
  setThemeColor: React.Dispatch<React.SetStateAction<ThemeColors>>
}
