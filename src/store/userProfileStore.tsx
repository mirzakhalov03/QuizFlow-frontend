import { create } from 'zustand'
import { userProfileService, type AiFeedbackRecord } from '../api/services/userProfile.service'

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
  aiFeedback: AiFeedbackRecord | null
  aiFeedbackGeneratedAt: string | null
  loading: boolean
  updating: boolean

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
  aiFeedback: null,
  aiFeedbackGeneratedAt: null,
  loading: false,
  updating: false,

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
        aiFeedback: data.aiFeedback,
        aiFeedbackGeneratedAt: data.aiFeedbackGeneratedAt,
      })
    } finally {
      set({ loading: false })
    }
  },

  updateProfile: async (data) => {
    set({ updating: true })
    try {
      const updated = await userProfileService.updateMe(data)
      set({
        bio: updated.bio,
        profilePicture: updated.profilePicture,
        isOnboarded: updated.isOnboarded,
      })
    } finally {
      set({ updating: false })
    }
  },
}))
