import { Link, Outlet } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { PATHS } from "@/lib/router/path"

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid place-items-center bg-muted/30 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-5 shadow-sm sm:p-6">
        <Link
          to={PATHS.landing}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
        <Outlet />
      </div>
    </div>
  )
}
