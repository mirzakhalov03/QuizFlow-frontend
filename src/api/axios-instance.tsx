import axios from 'axios'
import { authEvents } from '@/functions/AuthEvents'

export const api = axios.create({
  baseURL: 'http://localhost:3000/',
  withCredentials: true,
})
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true

      try {
        await api.post('/auth/refresh')
        return api(originalRequest)
      } catch {
        authEvents.emit('SESSION_EXPIRED')
      }
    }

    return Promise.reject(err)
  }
)

export default api
