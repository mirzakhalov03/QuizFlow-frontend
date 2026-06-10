import { api } from '@/api/axios-instance'

export type LoginPayload = { email: string; password: string }
export type RegisterPayload = { email: string; fullName: string; password: string }
export type RegisterConfirmPayload = { email: string; otp: string }
export type ForgotPasswordPayload = { email: string }
export type ResetPasswordPayload = { email: string; token: string; password: string }
export type SetPasswordPayload = { password: string }
export type DeleteAccountConfirmPayload = { otp: string }

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await api.post('/auth/login', payload)
    return data
  },

  async register(payload: RegisterPayload) {
    const { data } = await api.post('/auth/register', payload)
    return data
  },

  async registerConfirm(payload: RegisterConfirmPayload) {
    const { data } = await api.post('/auth/register/confirm', payload)
    return data
  },

  async me() {
    const { data } = await api.get('/auth/me')
    return data
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    const { data } = await api.post('/auth/password-reset', payload)
    return data
  },

  async resetPassword(payload: ResetPasswordPayload) {
    const { data } = await api.post('/auth/password-reset/confirm', payload)
    return data
  },

  async setPassword(payload: SetPasswordPayload) {
    const { data } = await api.post('/auth/set-password', payload)
    return data
  },

  async requestDeleteAccount() {
    const { data } = await api.post('/auth/delete-account/request')
    return data
  },

  async confirmDeleteAccount(payload: DeleteAccountConfirmPayload) {
    const { data } = await api.post('/auth/delete-account/confirm', payload)
    return data
  },
}
