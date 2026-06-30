import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ModalProvider } from '@/provider/modal-provider'

export default function RootLayout() {
  return (
    <>
      <ModalProvider>
        <Outlet />
        <Toaster />
        <ScrollRestoration />
      </ModalProvider>
    </>
  )
}
