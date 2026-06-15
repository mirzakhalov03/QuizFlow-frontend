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
    <div className="bg-muted/30 relative grid min-h-screen place-items-center overflow-hidden p-4">
      {/* Checked grid texture — fades out toward the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,hsl(243_80%_62%/0.30)_1px,transparent_1px),linear-gradient(to_bottom,hsl(243_80%_62%/0.30)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)] [background-size:44px_44px]"
      />
      {/* Soft abstract shapes in the primary color */}
      <div
        aria-hidden
        className="bg-primary/15 pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="bg-primary/10 pointer-events-none absolute -right-24 -bottom-28 h-80 w-80 rotate-12 rounded-[40%] blur-3xl"
      />
      {/* Small accent squares peeking out here and there */}
      <div
        aria-hidden
        className="border-primary/20 pointer-events-none absolute top-20 right-[18%] hidden h-12 w-12 rotate-12 rounded-lg border sm:block"
      />
      <div
        aria-hidden
        className="border-primary/15 pointer-events-none absolute bottom-24 left-[16%] hidden h-8 w-8 -rotate-6 rounded-md border sm:block"
      />

      <div className="border-border bg-background relative w-full max-w-md rounded-lg border p-5 shadow-sm sm:p-6">
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
