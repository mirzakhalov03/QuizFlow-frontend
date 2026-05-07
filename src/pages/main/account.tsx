import { useEffect, useState } from 'react'
import { Check, Link2OffIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/ui/image-upload'

import NotionLogo from '@/assets/notionLogo.png'
import GoogleLogo from '@/assets/googleLogo.png'

import { useAuthStore } from '@/hooks/use-authstore'
import { useUserProfileStore } from '@/store/userProfileStore'

import { imageUploadService } from '@/api/services/userProfile.service'

const connectedApps = [
  {
    name: 'Notion',
    description: 'Sync notes, templates, and study material directly from your workspace.',
    status: 'Connected',
    icon: NotionLogo,
  },
  {
    name: 'Google',
    description: 'Use Google sign-in and keep your account secure across devices.',
    status: 'Connected',
    icon: GoogleLogo,
  },
]

export default function Account() {
  const { user, updateUser } = useAuthStore()
  const [uploading, setUploading] = useState(false)

  const { profilePicture, fetchProfile, updateProfile, loading } = useUserProfileStore()
  const [draftFullName, setDraftFullName] = useState('')
  const [draftBio, setDraftBio] = useState('')
  const email = user?.email
  const loadProfile = async () => {
    await fetchProfile()

    const profile = useUserProfileStore.getState()
    const userState = useAuthStore.getState().user

    setDraftBio(profile.bio ?? '')
    setDraftFullName(userState?.fullName ?? '')
  }
  useEffect(() => {
    loadProfile()
  }, [])

  const handleSave = async () => {
    await Promise.all([updateUser({ fullName: draftFullName }), updateProfile({ bio: draftBio })])
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

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <span className="text-muted-foreground">Loading profile...</span>
      </div>
    )
  } else {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-primary text-2xl font-semibold sm:text-3xl">Account Details</h1>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
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
                <Button type="button" onClick={handleSave}>
                  Save changes
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-border bg-background rounded-2xl border p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold">Connected apps</h2>

              <p className="text-muted-foreground mt-1 text-sm">
                Manage external services tied to your account.
              </p>

              <div className="mt-5 space-y-4">
                {connectedApps.map((app) => (
                  <article key={app.name} className="border-border rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-primary inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold">
                          <img src={app.icon} alt={`${app.name} logo`} className="h-6 w-6" />
                        </span>

                        <h3 className="font-semibold">{app.name}</h3>
                      </div>

                      <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold">
                        <Check size={12} />
                        {app.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        leftIcon={<Link2OffIcon size={14} />}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
}
