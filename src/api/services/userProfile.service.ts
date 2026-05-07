import { api } from '@/api/axios-instance'

export type UserProfile = {
  userId: string
  bio: string | null
  profilePicture: string | null
}

export const userProfileService = {
  async getMe(): Promise<UserProfile> {
    const { data } = await api.get('/userProfile/me')
    return data
  },

  async updateMe(payload: {
    bio?: string | null
    profilePicture?: string | null
  }): Promise<UserProfile> {
    const { data } = await api.put('/userProfile/me', payload)
    return data
  },

  async deleteMe(): Promise<{ message: string }> {
    const { data } = await api.delete('/userProfile/me')
    return data
  },
}

export const imageUploadService = {
  async uploadProfilePicture(file: File) {
    const formData = new FormData()
    formData.append('profilePicture', file)

    const { data } = await api.put('/userProfile/me/avatar', formData)

    return data
  },
}
