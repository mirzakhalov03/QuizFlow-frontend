import axios from 'axios'
import { authEvents } from '@/functions/AuthEvents'
import { API_URL } from '@/lib/config'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

const SKIP_RETRY_URLS = ['/auth/refresh', '/auth/login', '/auth/register']

let refreshPromise: Promise<void> | null = null

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

      if (!refreshPromise) {
        refreshPromise = api
          .post('/auth/refresh')
          .then(() => {})
          .catch((refreshErr) => {
            authEvents.emit('SESSION_EXPIRED')
            throw refreshErr
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      try {
        await refreshPromise
        return api(originalRequest)
      } catch {
        return Promise.reject(err)
      }
    }

    return Promise.reject(err)
  }
)

export default api
