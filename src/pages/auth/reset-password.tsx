import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'
import { cn } from '@/lib/utils'
import { authService } from '@/api/services/auth.service'
import { toast } from '@/lib/toast'

const inputClass = cn(
  'w-full h-10 px-3 rounded-md border border-border bg-background text-sm',
  'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary'
)

export default function ResetPassword() {
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const password = form.get('password') as string
    const confirm = form.get('confirm') as string

    if (password !== confirm) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await authService.resetPassword({ email: form.get('email') as string, token, password })
      toast.success('Password updated. Please sign in.')
      navigate(PATHS.auth.login, { replace: true })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; detail?: string } } }
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.detail ??
        'Reset failed. The link may have expired.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Invalid link</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            This reset link is missing or invalid. Please request a new one.
          </p>
        </div>
        <p className="text-muted-foreground text-center text-sm">
          <Link to={PATHS.auth.forgotPassword} className="text-foreground hover:underline">
            Request a new link
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Set new password</h1>
        <p className="text-muted-foreground text-sm">Choose a strong password for your account.</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          New password
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

      <div className="space-y-1">
        <label htmlFor="confirm" className="text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Update password
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        <Link to={PATHS.auth.login} className="text-foreground hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
