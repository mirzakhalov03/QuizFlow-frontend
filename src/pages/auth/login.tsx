import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'
import { cn } from '@/lib/utils'
import { authService } from '@/api/services/auth.service'
import { useAuthStore } from '@/store/use-authstore'
import { toast } from '@/lib/toast'

const inputClass = cn(
  'w-full h-10 px-3 rounded-md border border-border bg-background text-sm',
  'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary'
)

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setUser = useAuthStore((s) => s.setUser)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    try {
      await authService.login({
        email: form.get('email') as string,
        password: form.get('password') as string,
      })
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string; detail?: string }; status?: number }
      }

      if (e?.response) {
        const msg =
          e.response.data?.message ??
          e.response.data?.detail ??
          'Invalid email or password'
        toast.error(msg)
        setLoading(false)
        return
      }
      // No response = CORS error from backend redirect — cookies are set, fall through to me()
    }

    try {
      const me = await authService.me()
      const user = me?.user ?? me?.data ?? me
      setUser(user)

      const from = searchParams.get('from')
      navigate(from && from.startsWith('/app') ? from : PATHS.app.dashboard, { replace: true })
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-muted-foreground text-sm">Welcome back — sign in to continue.</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Link
            to={PATHS.auth.forgotPassword}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Forgot?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Sign in
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        No account?{' '}
        <Link to={PATHS.auth.register} className="text-foreground hover:underline">
          Create one
        </Link>
      </p>
    </form>
  )
}
