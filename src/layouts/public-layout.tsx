import { Outlet } from 'react-router-dom'
import Header from '@/components/landing/header'
import Footer from '@/components/landing/footer'

export default function PublicLayout() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      {/* Content fills at least the viewport so the footer always sits below the
          fold — it's only revealed once the user scrolls. */}
      <main className="min-h-screen flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
