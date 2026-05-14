import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'

export default function NotFound() {
  return (
    <main className="bg-muted/30 grid min-h-screen place-items-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-muted-foreground text-sm font-semibold">404</p>
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
