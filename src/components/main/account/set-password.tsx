import { useState, type FormEvent } from 'react'
import { KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { authService } from '@/api/services/auth.service'
import { useAuthStore, type User } from '@/store/use-authstore'
import { toast } from '@/lib/toast'

const inputClass = cn(
  'h-10 w-full rounded-md border border-border bg-background px-3 text-sm',
  'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary'
)

export default function SetPassword() {
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const { user, setUser } = useAuthStore()

  if (!user) return null

  if (!user.hasPassword) {
    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setLoading(true)
      const form = new FormData(e.currentTarget)
      try {
        await authService.setPassword({ password: form.get('password') as string })
        if (user) {
          setUser({ ...user, hasPassword: true })
        }
        toast.success('Password set. You can now sign in with your email too.')
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string; detail?: string } } }
        const msg =
          e?.response?.data?.message ?? e?.response?.data?.detail ?? 'Failed to set password.'
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="border-border bg-background rounded-2xl border p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-muted-foreground" />
          <h2 className="text-lg font-semibold">Set a password</h2>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Add a password so you can sign in with your email too.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <label className="grid gap-1.5 text-sm">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </label>

          <div className="flex justify-end pt-1">
            <Button type="submit" size="sm" loading={loading}>
              Set password
            </Button>
          </div>
        </form>
      </div>
    )
  }

  const sendResetLink = async () => {
    setLoading(true)
    try {
      await authService.forgotPassword({ email: user.email })
      setResetSent(true)
    } catch {
      toast.error('Could not send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-border bg-background rounded-2xl border p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <KeyRound size={18} className="text-muted-foreground" />
        <h2 className="text-lg font-semibold">Change password</h2>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        {resetSent
          ? "We've sent a reset link to your email address."
          : "We'll send a reset link to your email address."}
      </p>

      {!resetSent && (
        <div className="mt-5 flex justify-end">
          <Button size="sm" loading={loading} onClick={sendResetLink}>
            Send reset link
          </Button>
        </div>
      )}
    </div>
  )
}
