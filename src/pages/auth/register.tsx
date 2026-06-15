import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OtpInput } from '@/components/form/otp-input'
import { PasswordInput } from '@/components/form/password-input'
import { PasswordRequirements, isPasswordValid } from '@/components/form/password-requirements'
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
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()

  const passwordsMatch = password === confirmPassword
  const canRegister = isPasswordValid(password) && passwordsMatch
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
        password,
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

    try {
      await authService.registerConfirm({
        email: pendingEmail!,
        otp,
      })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; detail?: string } } }

      if (e?.response) {
        const msg =
          e.response.data?.message ?? e.response.data?.detail ?? 'Invalid code. Please try again.'
        toast.error(msg)
        setOtp('')
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

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Verification code</label>
          <OtpInput
            value={otp}
            onChange={setOtp}
            disabled={loading}
            autoFocus
            ariaLabel="Verification code"
          />
        </div>

        <Button type="submit" loading={loading} disabled={otp.length !== 6} className="w-full">
          Verify
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Wrong email?{' '}
          <button
            type="button"
            onClick={() => {
              setPendingEmail(null)
              setOtp('')
            }}
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
        <PasswordInput
          id="password"
          name="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {password.length > 0 && (
          <div className="pt-1">
            <PasswordRequirements value={password} />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm password
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {confirmPassword.length > 0 && (
          <p
            className={cn(
              'flex items-center gap-2 pt-1 text-xs',
              passwordsMatch ? 'text-emerald-600' : 'text-destructive'
            )}
          >
            {passwordsMatch ? (
              <Check className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0" />
            )}
            {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
          </p>
        )}
      </div>

      <Button type="submit" loading={loading} disabled={!canRegister} className="w-full">
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
