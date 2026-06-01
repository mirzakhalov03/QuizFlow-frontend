import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/ui/image-upload'
import ConnectedApps from '@/components/main/account/connected-apps'
import SetPassword from '@/components/main/account/set-password'
import ByokSection from '@/components/main/account/byok-section'

import { useAuthStore } from '@/store/use-authstore'
import { useUserProfileStore } from '@/store/userProfileStore'

import { imageUploadService } from '@/api/services/userProfile.service'

export default function Account() {
  const { user, updateUser } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

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

      updateProfile({
        profilePicture: updatedProfile.profilePicture,
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-primary text-2xl font-semibold sm:text-3xl">Account Details</h1>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* LEFT COLUMN — Personal details */}
        <div className="space-y-6">
          <div className="border-border bg-background rounded-2xl border p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-4">
              <ImageUpload value={profilePicture} onChange={handleUpload} loading={uploading} />

              <span>
                <h2 className="text-lg font-semibold">Personal details</h2>

                <p className="text-muted-foreground mt-1 text-sm">
                  Update your name, email, and bio so the rest of the product feels more personal.
                </p>
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm sm:col-span-1">
                Full name
                <input
                  className="border-border bg-background h-11 rounded-md border px-3"
                  value={draftFullName}
                  onChange={(e) => setDraftFullName(e.target.value)}
                />
              </label>

              <label className="grid gap-1.5 text-sm sm:col-span-1">
                Email
                <input
                  type="email"
                  value={email ?? ''}
                  disabled
                  className="border-border bg-background h-11 rounded-md border px-3 opacity-70"
                />
              </label>

              <label className="grid gap-1.5 text-sm sm:col-span-2">
                Bio
                <textarea
                  className="border-border bg-background rounded-md border px-3 py-2"
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
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

      <ByokSection />

      <SetPassword />
    </div>
  )
}
