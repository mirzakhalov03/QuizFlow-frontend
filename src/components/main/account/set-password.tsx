import { useState, type FormEvent, type ReactNode } from 'react'
import { Check, KeyRound, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/form/password-input'
import { PasswordRequirements, isPasswordValid } from '@/components/form/password-requirements'
import { cn } from '@/lib/utils'
import { authService } from '@/api/services/auth.service'
import { useAuthStore } from '@/store/use-authstore'
import { toast } from '@/lib/toast'

function getErrorMessage(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string; detail?: string } } }
  return e?.response?.data?.message ?? e?.response?.data?.detail ?? fallback
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="border-border bg-background rounded-2xl border p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6 lg:p-8">
      <div className="flex items-center gap-2">
        <KeyRound size={18} className="text-muted-foreground" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      {label}
      {children}
    </label>
  )
}

function MatchHint({ value, against }: { value: string; against: string }) {
  if (!value) return null
  const matches = value === against
  return (
    <p
      className={cn(
        'flex items-center gap-2 text-xs',
        matches ? 'text-emerald-600' : 'text-destructive'
      )}
    >
      {matches ? (
        <Check className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <X className="h-3.5 w-3.5 shrink-0" />
      )}
      {matches ? 'Passwords match' : 'Passwords do not match'}
    </p>
  )
}

export default function SetPassword() {
  const { user, setUser } = useAuthStore()

  if (!user) return null

  return user.hasPassword ? (
    <ChangePasswordCard email={user.email} />
  ) : (
    <SetPasswordCard onSet={() => setUser({ ...user, hasPassword: true })} />
  )
}

function SetPasswordCard({ onSet }: { onSet: () => void }) {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const canSubmit = isPasswordValid(password) && password === confirm

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.setPassword({ password })
      onSet()
      setPassword('')
      setConfirm('')
      toast.success('Password set. You can now sign in with your email too.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to set password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Set a password" subtitle="Add a password so you can sign in with your email too.">
      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <Field label="Password">
          <PasswordInput
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {password.length > 0 && <PasswordRequirements value={password} />}

        <Field label="Confirm password">
          <PasswordInput
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <MatchHint value={confirm} against={password} />

        <div className="flex justify-end pt-1">
          <Button type="submit" size="sm" loading={loading} disabled={!canSubmit}>
            Set password
          </Button>
        </div>
      </form>
    </Card>
  )
}

function ChangePasswordCard({ email }: { email: string }) {
  const [loading, setLoading] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const canSubmit =
    currentPassword.length > 0 && isPasswordValid(newPassword) && newPassword === confirm

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
      toast.success('Password changed.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to change password.'))
    } finally {
      setLoading(false)
    }
  }

  const sendResetLink = async () => {
    setSendingReset(true)
    try {
      await authService.forgotPassword({ email })
      setResetSent(true)
      toast.success('Reset link sent to your email.')
    } catch {
      toast.error('Could not send reset link. Please try again.')
    } finally {
      setSendingReset(false)
    }
  }

  return (
    <Card title="Change password" subtitle="Enter your current password, then choose a new one.">
      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <Field label="Current password">
          <PasswordInput
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </Field>

        <Field label="New password">
          <PasswordInput
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Field>
        {newPassword.length > 0 && <PasswordRequirements value={newPassword} />}

        <Field label="Confirm new password">
          <PasswordInput
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <MatchHint value={confirm} against={newPassword} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
          <button
            type="button"
            onClick={sendResetLink}
            disabled={sendingReset || resetSent}
            className="text-muted-foreground text-left text-xs hover:underline disabled:opacity-50"
          >
            {resetSent ? 'Reset link sent' : 'Forgot your current password?'}
          </button>
          <Button type="submit" size="sm" loading={loading} disabled={!canSubmit} className="w-full sm:w-auto">
            Change password
          </Button>
        </div>
      </form>
    </Card>
  )
}
