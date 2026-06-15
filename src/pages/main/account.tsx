import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/ui/image-upload'
import Modal from '@/components/custom/modal'
import ConnectedApps from '@/components/main/account/connected-apps'
import SetPassword from '@/components/main/account/set-password'
import ByokSection from '@/components/main/account/byok-section'

import { useAuthStore } from '@/store/use-authstore'
import { useUserProfileStore } from '@/store/userProfileStore'
import { useModal } from '@/hooks/useModal'
import { authService } from '@/api/services/auth.service'
import { imageUploadService } from '@/api/services/userProfile.service'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { PATHS } from '@/lib/path'

const otpClass = cn(
  'h-10 w-full rounded-md border border-border bg-background px-3 text-center font-mono text-lg tracking-[0.5em]',
  'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary'
)

export default function Account() {
  const { user, updateUser, setUser } = useAuthStore()
  const navigate = useNavigate()
  const { openModal, closeModal } = useModal('delete-account')

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteRequesting, setDeleteRequesting] = useState(false)
  const [deleteConfirming, setDeleteConfirming] = useState(false)

  const { profilePicture, updateProfile, bio, fetchProfile } = useUserProfileStore()
  const [draftFullName, setDraftFullName] = useState('')
  const [draftBio, setDraftBio] = useState('')
  const email = user?.email

  useEffect(() => {
    if (user?.fullName) setDraftFullName(user.fullName)
  }, [user?.fullName])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    setDraftBio(bio ?? '')
  }, [bio])

  const handleSave = async () => {
    try {
      setSaving(true)
      await Promise.all([updateUser({ fullName: draftFullName }), updateProfile({ bio: draftBio })])
    } catch (error) {
      console.error('Failed to update profile', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (file: File) => {
    try {
      setUploading(true)
      const updatedProfile = await imageUploadService.uploadProfilePicture(file)
      updateProfile({ profilePicture: updatedProfile.profilePicture })
    } finally {
      setUploading(false)
    }
  }

  const handleRequestDelete = async () => {
    setDeleteRequesting(true)
    try {
      await authService.requestDeleteAccount()
      openModal()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; detail?: string } } }
      const msg = e?.response?.data?.message ?? e?.response?.data?.detail ?? 'Failed to send code.'
      toast.error(msg)
    } finally {
      setDeleteRequesting(false)
    }
  }

  const handleConfirmDelete = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setDeleteConfirming(true)
    try {
      await authService.confirmDeleteAccount({ otp: form.get('otp') as string })
      closeModal()
      setUser(null)
      navigate(PATHS.landing, { replace: true })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; detail?: string } } }
      const msg = e?.response?.data?.message ?? e?.response?.data?.detail ?? 'Invalid code.'
      toast.error(msg)
    } finally {
      setDeleteConfirming(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-primary text-2xl font-semibold sm:text-3xl">Account Details</h1>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* LEFT COLUMN — Personal details */}
        <div className="space-y-6">
          <div className="border-border bg-background rounded-2xl border p-5 shadow-sm sm:p-6">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
              <ImageUpload value={profilePicture} onChange={handleUpload} loading={uploading} />
              <span>
                <h2 className="text-lg font-semibold">Personal details</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Update your name, email, and bio so the rest of the product feels more personal.
                </p>
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid min-w-0 gap-1.5 text-sm sm:col-span-1">
                Full name
                <input
                  className="border-border bg-background h-11 w-full min-w-0 rounded-md border px-3"
                  value={draftFullName}
                  onChange={(e) => setDraftFullName(e.target.value)}
                />
              </label>

              <label className="grid min-w-0 gap-1.5 text-sm sm:col-span-1">
                Email
                <input
                  type="email"
                  value={email ?? ''}
                  disabled
                  className="border-border bg-background h-11 w-full min-w-0 rounded-md border px-3 opacity-70"
                />
              </label>

              <label className="grid min-w-0 gap-1.5 text-sm sm:col-span-2">
                Bio
                <textarea
                  className="border-border bg-background w-full min-w-0 rounded-md border px-3 py-2"
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                loading={deleteRequesting}
                onClick={handleRequestDelete}
              >
                Delete account
              </Button>

              <Button type="button" onClick={handleSave} loading={saving} disabled={saving}>
                Save changes
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ConnectedApps />
        </div>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ByokSection />
        <SetPassword />
      </section>

      <Modal
        modalKey="delete-account"
        title="Delete account"
        description={`We sent a 6-digit code to ${email ?? 'your email'}. Enter it below to permanently delete your account. This cannot be undone.`}
        size="max-w-sm"
      >
        <form onSubmit={handleConfirmDelete} className="space-y-3">
          <input
            name="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            placeholder="000000"
            className={otpClass}
          />
          <Button
            type="submit"
            className="bg-destructive hover:bg-destructive/90 w-full text-white"
            loading={deleteConfirming}
          >
            Permanently delete
          </Button>
        </form>
      </Modal>
    </div>
  )
}
