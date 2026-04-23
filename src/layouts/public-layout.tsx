import { Outlet } from 'react-router-dom'
import Header from '@/components/landing/header'
import Footer from '@/components/landing/footer'

export default function PublicLayout() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
