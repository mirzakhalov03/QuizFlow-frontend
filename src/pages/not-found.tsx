import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PATHS } from "@/lib/router/path"

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center bg-muted/30 p-4">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm font-semibold text-muted-foreground">404</p>
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to={PATHS.landing}>
          <Button>Back to home</Button>
        </Link>
      </div>
    </main>
  )
}
