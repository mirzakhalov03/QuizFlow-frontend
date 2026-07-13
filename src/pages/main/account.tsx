import { useEffect, useState, useRef, type FormEvent, useLayoutEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { User, Link2, Key, KeyRound, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/ui/image-upload'
import Modal from '@/components/custom/modal'
import ConnectedApps from '@/components/main/account/connected-apps'
import SetPassword from '@/components/main/account/set-password'
import ByokSection from '@/components/main/account/byok-section'
import { Input } from '@/components/ui/input'
import ConfirmDialog from '@/components/ui/confirm-dialog'

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
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)

  const { profilePicture, updateProfile, bio, fetchProfile } = useUserProfileStore()
  const [draftFullName, setDraftFullName] = useState('')
  const [draftBio, setDraftBio] = useState('')
  const tabParam = searchParams.get('tab')
  const activeTab = ['profile', 'integrations', 'byok', 'security'].includes(tabParam || '')
    ? (tabParam as string)
    : 'profile'

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const email = user?.email

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

  useLayoutEffect(() => {
    const handleResize = () => {
      const activeEl = tabRefs.current[activeTab]
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.clientWidth,
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    // Wait a brief tick in case fonts or container layout reflowed
    const timer = setTimeout(handleResize, 50)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timer)
    }
  }, [activeTab])

  const handleSave = async () => {
    try {
      setSaving(true)
      await Promise.all([updateUser({ fullName: draftFullName }), updateProfile({ bio: draftBio })])
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Failed to update profile', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (file: File) => {
    try {
      setUploading(true)
      const updatedProfile = await imageUploadService.uploadProfilePicture(file)
      updateProfile({ profilePicture: updatedProfile.profilePicture })
      toast.success('Profile picture updated successfully')
    } catch {
      toast.error('Failed to upload profile picture')
    } finally {
      setUploading(false)
    }
  }

  const handleRequestDelete = async () => {
    setIsConfirmDeleteOpen(false)
    openModal()
    setDeleteRequesting(true)
    try {
      await authService.requestDeleteAccount()
    } catch (err: unknown) {
      closeModal()
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

  const hasChanges = draftFullName !== (user?.fullName ?? '') || draftBio !== (bio ?? '')

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your account preferences, developer keys, and secure connections.
        </p>
      </header>

      {/* HORIZONTAL TAB MENU */}
      <nav
        role="tablist"
        className="bg-muted relative flex w-full gap-1 overflow-x-auto rounded-xl p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Settings sections"
      >
        {/* Sliding active indicator */}
        <div
          className="bg-primary absolute top-1 bottom-1 rounded-lg shadow-sm transition-all duration-300 ease-in-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />

        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el
              }}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative z-10 flex min-w-max flex-1 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-300',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
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
              <div className="flex flex-col-reverse items-end gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex w-full flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                  <ImageUpload value={profilePicture} onChange={handleUpload} loading={uploading} />
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold">Personal details</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Update your name, email, and bio so the rest of the product feels more
                      personal.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="text-destructive hover:bg-destructive/10 hover:border-destructive/20 hidden shrink-0 cursor-pointer rounded-full border border-transparent p-2 transition-all duration-200 sm:block"
                  aria-label="Delete Account"
                  title="Delete Account"
                >
                  <Trash2 size={20} />
                </button>
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

              <div className="mt-6 flex items-center justify-between gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="text-destructive hover:bg-destructive/10 hover:border-destructive/20 cursor-pointer rounded-full border border-transparent p-2 transition-all duration-200 sm:hidden"
                  aria-label="Delete Account"
                  title="Delete Account"
                >
                  <Trash2 size={20} />
                </button>
                <Button type="button" onClick={handleSave} loading={saving} disabled={saving || !hasChanges}>
                  Save changes
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
        title="Verify your identity"
        description={
          deleteRequesting
            ? 'Requesting verification code to your email...'
            : `We sent a 6-digit code to ${email ?? 'your email'}. Enter it below to permanently delete your account.`
        }
        size="max-w-sm"
        closable={!deleteRequesting && !deleteConfirming}
      >
        <form onSubmit={handleConfirmDelete} className="space-y-3">
          <input
            name="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            disabled={deleteRequesting || deleteConfirming}
            autoComplete="one-time-code"
            placeholder="000000"
            className={cn(
              otpClass,
              (deleteRequesting || deleteConfirming) && 'pointer-events-none opacity-50'
            )}
          />
          <Button
            type="submit"
            className="bg-destructive hover:bg-destructive/90 w-full text-white"
            loading={deleteConfirming || deleteRequesting}
            disabled={deleteRequesting}
          >
            {deleteRequesting ? 'Sending Code...' : 'Permanently delete'}
          </Button>
        </form>
      </Modal>

      {/* CONFIRM REQUEST DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleRequestDelete}
        title="Delete account?"
        description="This will permanently delete your account, including all your quizzes, library folders, and analytics. This action cannot be undone. We will send a confirmation code to your email."
        confirmLabel="Send Code & Delete"
        cancelLabel="Cancel"
        variant="destructive"
        loading={deleteRequesting}
      />
    </div>
  )
}
