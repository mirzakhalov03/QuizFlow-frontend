import { api } from '@/api/axios-instance'

export type UpdateUserPayload = {
  fullName?: string
  activeApiKeyId?: string | null
}

export const userService = {
  async updateMe(payload: UpdateUserPayload) {
    const { data } = await api.put('/user/me', payload)
    return data
  },
}
