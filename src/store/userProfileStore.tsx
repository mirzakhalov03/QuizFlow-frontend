import { create } from 'zustand'
import { userProfileService } from '../api/services/userProfile.service'

type ProfileData = {
  bio: string | null
  profilePicture: string | null
}

type UpdateProfileData = {
  bio?: string | null
  profilePicture?: string | null
}

type UserProfileState = {
  bio: string | null
  profilePicture: string | null
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
  loading: false,
  setBio: (bio) =>
    set({
      bio,
    }),

  setProfilePicture: (profilePicture) =>
    set({
      profilePicture,
    }),
  setProfile: (data) =>
    set({
      bio: data.bio,
      profilePicture: data.profilePicture,
    }),

  fetchProfile: async () => {
    set({ loading: true })
    try {
      const data = await userProfileService.getMe()
      set({
        bio: data.bio,
        profilePicture: data.profilePicture,
      })
    } finally {
      set({ loading: false })
    }
  },

  updateProfile: async (data) => {
    set({ loading: true })
    try {
      const updated = await userProfileService.updateMe(data)
      set({
        bio: updated.bio,
        profilePicture: updated.profilePicture,
      })
    } finally {
      set({ loading: false })
    }
  },
}))
