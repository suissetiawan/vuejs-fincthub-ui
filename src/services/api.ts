import axios from 'axios'
import { setupMockInterceptor } from '@/mocks'

const api = axios.create({
  baseURL: '/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Setup Mock Interceptor
setupMockInterceptor(api)

export const setupInterceptors = (authStore: any) => {
  api.interceptors.request.use(
    (config) => {
      if (authStore.accessToken) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`
      }
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
      return config
    },
    (error) => Promise.reject(error),
  )

  api.interceptors.response.use(
    (response) => {
      console.log(`[API Response Success] ${response.config.url}`)
      return response
    },
    async (error) => {
      console.log(`[API Response Error] ${error.config?.url} - Status: ${error.response?.status}`)
      const originalRequest = error.config
      const isAuthRequest = originalRequest?.url?.includes('/auth/')

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !isAuthRequest
      ) {
        originalRequest._retry = true
        try {
          console.log('[API] Attempting token refresh...')
          await authStore.refreshTokenAction()
          console.log('[API] Token refresh successful, retrying request...')
          return api(originalRequest)
        } catch (refreshError) {
          console.error('[API] Token refresh failed, logging out...')
          authStore.logout()
          return Promise.reject(refreshError)
        }
      }
      return Promise.reject(error)
    },
  )
}

export default api
