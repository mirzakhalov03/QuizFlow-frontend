import { Link, Outlet, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PATHS } from '@/lib/path'
import { Button } from '@/components/ui/button'
import { API_URL } from '@/lib/config'
import googleLogo from '@/assets/googleLogo.png'

const OAUTH_PATHS: string[] = [PATHS.auth.login, PATHS.auth.register]

export default function AuthLayout() {
  const { pathname } = useLocation()
  const showGoogle = OAUTH_PATHS.includes(pathname)

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`
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
        {showGoogle && (
          <div className="mt-4">
            <p className="text-muted-foreground text-center text-sm">or continue with</p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="mb-2 w-full p-2"
                onClick={handleGoogleLogin}
              >
                <img src={googleLogo} alt="Google" className="h-5 w-5" /> Google
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
