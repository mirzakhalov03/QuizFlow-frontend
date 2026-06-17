import { create } from 'zustand'
import { userProfileService } from '../api/services/userProfile.service'

type ProfileData = {
  bio: string | null
  profilePicture: string | null
  isOnboarded: boolean | null
}

type UpdateProfileData = {
  bio?: string | null
  profilePicture?: string | null
  isOnboarded?: boolean
}

type UserProfileState = {
  bio: string | null
  profilePicture: string | null
  isOnboarded: boolean | null
  loading: boolean
  updating: boolean
  hasLoaded: boolean

  setProfile: (data: ProfileData) => void
  setBio: (bio: string | null) => void
  setProfilePicture: (url: string | null) => void

  fetchProfile: (force?: boolean) => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<void>
  reset: () => void
}

// The profile (bio / avatar / onboarding flag) doesn't change mid-session except
// through this store's own mutations, so there's no reason to re-hit the network
// on every component mount. We fetch once and dedupe concurrent callers via a
// shared in-flight promise — this collapses the StrictMode double-mount, the
// AppLayout-on-reentry refetch, and account.tsx's redundant call into one request.
let inflight: Promise<void> | null = null

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  bio: null,
  profilePicture: null,
  isOnboarded: null,
  loading: false,
  updating: false,
  hasLoaded: false,

  setBio: (bio) => set({ bio }),

  setProfilePicture: (profilePicture) => set({ profilePicture }),

  setProfile: (data) =>
    set({
      bio: data.bio,
      profilePicture: data.profilePicture,
      isOnboarded: data.isOnboarded,
      hasLoaded: true,
    }),

  fetchProfile: async (force = false) => {
    // Already have it (and not forcing a refresh) → no-op.
    if (!force && get().hasLoaded) return
    // A request is already in flight → reuse it instead of firing another.
    if (inflight) return inflight

    set({ loading: true })
    inflight = (async () => {
      try {
        const data = await userProfileService.getMe()
        set({
          bio: data.bio,
          profilePicture: data.profilePicture,
          isOnboarded: data.isOnboarded,
          hasLoaded: true,
        })
      } catch {
        // Leave existing state intact; the onboarding gate stays closed on a failed fetch.
      } finally {
        set({ loading: false })
        inflight = null
      }
    })()

    return inflight
  },

  updateProfile: async (data) => {
    set({ updating: true })
    try {
      const updated = await userProfileService.updateMe(data)
      set({
        bio: updated.bio,
        profilePicture: updated.profilePicture,
        isOnboarded: updated.isOnboarded,
        hasLoaded: true,
      })
    } finally {
      set({ updating: false })
    }
  },

  // Clear profile state on logout / session loss so the next user never sees the
  // previous account's avatar or bio. Also drops any in-flight request and the
  // hasLoaded guard, so the next fetchProfile() actually hits the network.
  reset: () => {
    inflight = null
    set({
      bio: null,
      profilePicture: null,
      isOnboarded: null,
      loading: false,
      updating: false,
      hasLoaded: false,
    })
  },
}))
