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
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)

    try {
      const res = await authService.register({
        email: form.get('email') as string,
        fullName: form.get('name') as string,
        password: form.get('password') as string,
      })

      const extracted = res?.data?.user ?? res?.user ?? res
      setUser({ ...extracted, hasPassword: true })
      navigate(PATHS.app.dashboard, { replace: true })
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

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
