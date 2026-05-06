import { api } from '@/api/axios-instance'

export type UserProfile = {
  id: string
  userId: string
  bio: string | null
  profilePicture: string | null
  createdAt: string
  updatedAt: string
}

export type UpdateUserProfileDto = {
  bio?: string | null
  profilePicture?: string | null
}

export const getUserProfile = async (): Promise<UserProfile> => {
  const { data } = await api.get('/userProfile/me')
  return data
}

export const updateUserProfile = async (payload: UpdateUserProfileDto): Promise<UserProfile> => {
  const { data } = await api.put('/userProfile/me', payload)
  return data
}

export const deleteUserProfile = async (): Promise<{ message: string }> => {
  const { data } = await api.delete('/userProfile/me')
  return data
}
