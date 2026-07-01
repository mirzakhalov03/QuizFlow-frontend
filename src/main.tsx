import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppRouter } from '@/router/router'
import { ThemeProvider } from './layouts/theme'
import { AuthInitializer } from './functions/authInitializer'
import { Analytics } from "@vercel/analytics/react"
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/700.css'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthInitializer>
          <AppRouter />
          <Analytics />
        </AuthInitializer>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
