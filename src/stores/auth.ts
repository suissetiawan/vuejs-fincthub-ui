import { defineStore } from 'pinia'
import api from '@/services/api'
import { useUiStore } from './ui'

interface User {
  id: number
  username: string
  email: string
  role: 'USER' | 'ADMIN'
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
}

const safeParse = (key: string) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (e) {
    console.error(`Error parsing localStorage key "${key}":`, e)
    localStorage.removeItem(key)
    return null
  }
}

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: safeParse('user'),
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }),
  getters: {
    isLoggedIn: (state) => !!state.accessToken && state.accessToken !== 'undefined',
    isAdmin: (state) => state.user?.role === 'ADMIN',
    displayName: (state) => {
      if (!state.user?.email) return 'User'
      // Extract prefix before @
      const prefix = state.user.email.split('@')[0]
      // Split by . or - and take the first part
      const firstName = prefix.split(/[.-]/)[0]
      // Capitalize first letter
      return firstName.charAt(0).toUpperCase() + firstName.slice(1)
    },
  },
  actions: {
    async login(credentials: any) {
      const uiStore = useUiStore()
      uiStore.setLoading(true, 'Logging in...')
      try {
        const response = await api.post('/auth/login', credentials)
        const data = response.data.response

        this.accessToken = data.accessToken
        this.refreshToken = data.refreshToken

        const payload = parseJwt(this.accessToken!)
        this.user = {
          id: data.userId,
          username: credentials.username || credentials.email,
          email: credentials.email || '',
          role: payload?.role || 'USER',
        }

        localStorage.setItem('accessToken', this.accessToken!)
        localStorage.setItem('refreshToken', this.refreshToken!)
        localStorage.setItem('user', JSON.stringify(this.user))
        return response.data
      } catch (error) {
        throw error
      } finally {
        uiStore.setLoading(false)
      }
    },
    async register(userData: any) {
      try {
        const response = await api.post('/auth/register', userData)
        return response.data
      } catch (error) {
        throw error
      }
    },
    async refreshTokenAction() {
      if (!this.refreshToken) {
        this.logout()
        return
      }
      try {
        const response = await api.post('/auth/refresh', {
          refreshToken: this.refreshToken,
        })
        const data = response.data.response
        this.accessToken = data.accessToken
        localStorage.setItem('accessToken', this.accessToken!)
      } catch (error) {
        this.logout()
        throw error
      }
    },
    async logout() {
      const uiStore = useUiStore()
      uiStore.setLoading(true, 'Signing out...')
      try {
        if (this.accessToken) {
          await api.post('/auth/logout')
        }
      } catch (error) {
        console.error('Logout API failed:', error)
      } finally {
        this.accessToken = null
        this.refreshToken = null
        this.user = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        uiStore.setLoading(false)
      }
    },
  },
})
