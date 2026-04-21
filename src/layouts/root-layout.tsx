import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
      <ScrollRestoration />
    </>
  )
}
