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

  setProfile: (data: ProfileData) => void
  setBio: (bio: string | null) => void
  setProfilePicture: (url: string | null) => void

  fetchProfile: () => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<void>
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  bio: null,
  profilePicture: null,
  isOnboarded: null,
  loading: false,

  setBio: (bio) => set({ bio }),

  setProfilePicture: (profilePicture) => set({ profilePicture }),

  setProfile: (data) =>
    set({
      bio: data.bio,
      profilePicture: data.profilePicture,
      isOnboarded: data.isOnboarded,
    }),

  fetchProfile: async () => {
    set({ loading: true })
    try {
      const data = await userProfileService.getMe()
      set({
        bio: data.bio,
        profilePicture: data.profilePicture,
        isOnboarded: data.isOnboarded,
      })
    } finally {
      set({ loading: false })
    }
  },

  updateProfile: async (data) => {
    const updated = await userProfileService.updateMe(data)
    set({
      bio: updated.bio,
      profilePicture: updated.profilePicture,
      isOnboarded: updated.isOnboarded,
    })
  },
}))
