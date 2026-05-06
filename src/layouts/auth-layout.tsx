import { Link, Outlet } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PATHS } from '@/lib/path'
import { Button } from '@/components/ui/button'
import googleLogo from '@/assets/googleLogo.png'
import notionLogo from '@/assets/notionLogo.png'

export default function AuthLayout() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google'
  }

  const handleNotionLogin = () => {
    window.location.href = 'http://localhost:3000/auth/notion'
  }

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
        <div>
          <p className="text-muted-foreground text-center text-sm"> or continue with </p>

          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="mb-2 w-full p-2"
              onClick={handleGoogleLogin}
            >
              <img src={googleLogo} alt="Google" className="h-5 w-5" /> Google
            </Button>
            <Button variant="outline" size="sm" className="w-full p-2" onClick={handleNotionLogin}>
              <img src={notionLogo} alt="Notion" className="h-5 w-5" /> Notion
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
