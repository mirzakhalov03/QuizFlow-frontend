import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'
import { cn } from '@/lib/utils'
import { authService } from '@/api/services/auth.service'
import { toast } from '@/lib/toast'

const inputClass = cn(
  'w-full h-10 px-3 rounded-md border border-border bg-background text-sm',
  'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary'
)

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    try {
      await authService.forgotPassword({ email: form.get('email') as string })
      setSent(true)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; detail?: string } } }
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.detail ??
        'Something went wrong. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            We sent a password reset link to your email address. Follow the link to set a new
            password.
          </p>
        </div>
        <p className="text-muted-foreground text-center text-sm">
          <Link to={PATHS.auth.login} className="text-foreground hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Reset password</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we'll send you a reset link.
        </p>
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

      <Button type="submit" loading={loading} className="w-full">
        Send reset link
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        <Link to={PATHS.auth.login} className="text-foreground hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
