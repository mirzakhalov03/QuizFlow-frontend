import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { User, Link2, Key, KeyRound, ShieldAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/ui/image-upload'
import Modal from '@/components/custom/modal'
import ConnectedApps from '@/components/main/account/connected-apps'
import SetPassword from '@/components/main/account/set-password'
import ByokSection from '@/components/main/account/byok-section'
import { Input } from '@/components/ui/input'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const { openModal, closeModal } = useModal('delete-account')

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteRequesting, setDeleteRequesting] = useState(false)
  const [deleteConfirming, setDeleteConfirming] = useState(false)

  const { profilePicture, updateProfile, bio, fetchProfile } = useUserProfileStore()
  const [draftFullName, setDraftFullName] = useState('')
  const [draftBio, setDraftBio] = useState('')
  const email = user?.email

  const tabParam = searchParams.get('tab')
  const activeTab = ['profile', 'integrations', 'byok', 'security'].includes(tabParam || '')
    ? (tabParam as string)
    : 'profile'

  const setActiveTab = (tab: string) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.set('tab', tab)
      return params
    })
  }
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'byok', label: 'API Keys', icon: Key },
    { id: 'security', label: 'Security', icon: KeyRound },
  ]

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account preferences, developer keys, and secure connections.
        </p>
      </header>

      {/* HORIZONTAL TAB MENU */}
      <nav
        role="tablist"
        className="bg-muted flex w-full gap-1 overflow-x-auto rounded-xl p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Settings sections"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex min-w-max flex-1 shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* ACTIVE SETTINGS TAB CONTENT */}
      <div className="mt-2 w-full max-w-none">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Personal Details Card */}
            <div className="border-border bg-background rounded-2xl border p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6 lg:p-8">
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
                  <Input
                    fullWidth
                    className="bg-background h-11"
                    value={draftFullName}
                    onChange={(e) => setDraftFullName(e.target.value)}
                  />
                </label>

                <label className="grid min-w-0 gap-1.5 text-sm sm:col-span-1">
                  Email
                  <Input
                    fullWidth
                    type="email"
                    value={email ?? ''}
                    disabled
                    className="bg-background h-11 opacity-70"
                  />
                </label>

                <label className="grid min-w-0 gap-1.5 text-sm sm:col-span-2">
                  Bio
                  <textarea
                    className="border-input bg-background focus-visible:ring-ring flex min-h-24 w-full resize-y rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    value={draftBio}
                    onChange={(e) => setDraftBio(e.target.value)}
                    rows={3}
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <Button type="button" onClick={handleSave} loading={saving} disabled={saving}>
                  Save changes
                </Button>
              </div>
            </div>

            {/* Danger Zone Card */}
            <div className="rounded-2xl border border-red-200 bg-red-50/10 p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6 lg:p-8 dark:border-red-950/20 dark:bg-red-950/5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                    Danger Zone
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm font-normal">
                    Permanently delete your account and all associated quizzes and data. This action
                    cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:border-destructive hover:bg-destructive transition-all duration-200 hover:text-white"
                  loading={deleteRequesting}
                  onClick={handleRequestDelete}
                >
                  Delete account
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && <ConnectedApps />}
        {activeTab === 'byok' && <ByokSection />}
        {activeTab === 'security' && <SetPassword />}
      </div>

      {/* ACCOUNT DELETION MODAL */}
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
