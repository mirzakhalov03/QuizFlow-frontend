import { Link, Outlet } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PATHS } from '@/lib/router/path'

export default function AuthLayout() {
  return (
    <div className="bg-muted/30 grid min-h-screen place-items-center p-4">
      <div className="border-border bg-background w-full max-w-md rounded-lg border p-5 shadow-sm sm:p-6">
        <Link
          to={PATHS.landing}
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
        <Outlet />
      </div>
    </div>
  )
}
