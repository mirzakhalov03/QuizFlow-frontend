import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

export default function Register() {
  const [loading, setLoading] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const onRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string

    try {
      await authService.register({
        email,
        fullName: form.get('name') as string,
        password: form.get('password') as string,
      })
      setPendingEmail(email)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; detail?: string } } }
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.detail ??
        'Registration failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const onConfirm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    try {
      await authService.registerConfirm({
        email: pendingEmail!,
        otp: form.get('otp') as string,
      })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; detail?: string } } }

      if (e?.response) {
        const msg =
          e.response.data?.message ?? e.response.data?.detail ?? 'Invalid code. Please try again.'
        toast.error(msg)
        setLoading(false)
        return
      }
      // No response = CORS error from backend redirect — cookies are set, fall through to me()
    }

    try {
      const me = await authService.me()
      const user = me?.user ?? me?.data ?? me
      setUser({ ...user, hasPassword: true })
      navigate(PATHS.app.quizzes, { replace: true })
    } catch {
      toast.success('Account verified! Please sign in.')
      navigate(PATHS.auth.login, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  if (pendingEmail) {
    return (
      <form onSubmit={onConfirm} className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a 6-digit code to{' '}
            <span className="text-foreground font-medium">{pendingEmail}</span>. Enter it below to
            activate your account.
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="otp" className="text-sm font-medium">
            Verification code
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            placeholder="000000"
            className={cn(inputClass, 'text-center font-mono text-lg tracking-[0.5em]')}
          />
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Verify
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Wrong email?{' '}
          <button
            type="button"
            onClick={() => setPendingEmail(null)}
            className="text-foreground hover:underline"
          >
            Go back
          </button>
        </p>
      </form>
    )
  }

  return (
    <form onSubmit={onRegister} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="text-muted-foreground text-sm">Start building quizzes in under a minute.</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Full name
        </label>
        <input id="name" name="name" required autoComplete="name" className={inputClass} />
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
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Create account
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{' '}
        <Link to={PATHS.auth.login} className="text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
