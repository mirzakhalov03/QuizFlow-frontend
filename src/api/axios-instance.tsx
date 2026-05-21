import axios from 'axios'
import { authEvents } from '@/functions/AuthEvents'
import { API_URL } from '@/lib/config'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

const SKIP_RETRY_URLS = ['/auth/refresh', '/auth/login', '/auth/register']

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !SKIP_RETRY_URLS.includes(originalRequest.url)
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
