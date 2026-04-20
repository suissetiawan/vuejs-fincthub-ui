import { mockCategories } from './data/categories'
import { mockTransactions } from './data/transactions'
import { mockUsers, mockProfileAdmin, mockProfileUser } from './data/users'
import { LoginAdmin, LoginUser } from './data/auth'
import { mockSummary, mockFinancialBreakdown } from './data/dashboard'
import { mockBudgets } from './data/budgets'

// In-memory storage untuk simulasi database saat menggunakan mock
let mockTransactionsStore = [...mockTransactions]
let mockCategoriesStore = [...mockCategories]
let mockUsersStore = [...mockUsers]
let mockBudgetsStore = [...mockBudgets]
// Mutable profile for current user (untuk update profile)
const ADMIN_ID = 'd888913d-beb2-46fe-9325-7bebeb5714fc'
const USER_ID = '064a195e-5926-4fb7-9061-3fe9bb3a63e9'
let profileAdmin = { ...mockProfileAdmin }
let profileUser = { ...mockProfileUser }

/**
 * Setup Mock Interceptor untuk axios
 * Mengintercept semua request dan mengembalikan mock data sesuai endpoint
 */
export const setupMockInterceptor = (api: any) => {
  console.warn('[Mock API] System Initialized - All requests will use mock data')

  api.interceptors.request.use(async (config: any) => {
    const fullUrl = config.url || ''
    const method = config.method?.toLowerCase()
    let mockData: any = null

    // ========== AUTH ENDPOINTS ==========
    // Handle GET requests to auth endpoints (should return error silently)
    // This prevents errors when browser tries to prefetch or navigate to auth endpoints
    if (method === 'get' && fullUrl.includes('/auth/')) {
      // Auth endpoints don't support GET requests
      // Return empty response instead of error to prevent console errors
      config.adapter = async () => {
        return {
          data: { message: 'Method not allowed for this endpoint' },
          status: 405,
          statusText: 'Method Not Allowed',
          headers: config.headers,
          config,
        }
      }
      return config
    }

    // Handle POST requests to auth endpoints
    if (fullUrl.includes('/auth/login') && method === 'post') {
      const { email, password } = config.data
      if (email === 'suis@admin.com' && password === 'pass') {
        mockData = { response: LoginAdmin }
      } else if (email === 'bambang@user.com' && password === 'pass') {
        mockData = { response: LoginUser }
      } else {
        // Invalid credentials
        config.adapter = async () => {
          return Promise.reject({
            response: {
              status: 401,
              data: { message: 'Invalid credentials' },
            },
          })
        }
        return config
      }
    } else if (fullUrl.includes('/auth/register') && method === 'post') {
      const { email, username } = config.data
      const newUser = {
        id: mockUsersStore.length + 1,
        username: username || email.split('@')[0],
        email,
        role: 'USER',
      }
      mockUsersStore.push(newUser)
      mockData = { response: newUser, message: 'User registered successfully' }
    } else if (fullUrl.includes('/auth/refresh') && method === 'post') {
      // Mock token refresh - return new tokens
      mockData = {
        response: {
          accessToken: 'new_access_token_' + Date.now(),
          refreshToken: 'new_refresh_token_' + Date.now(),
        },
      }
    } else if (fullUrl.includes('/auth/logout') && method === 'post') {
      mockData = { message: 'Logged out successfully', response: {} }
    }

    // ========== GET REQUESTS ==========
    if (method === 'get') {
      // Categories
      if (fullUrl.endsWith('/api/categories')) {
        mockData = { response: mockCategoriesStore }
      } else if (fullUrl.includes('/api/categories/')) {
        const id = fullUrl.split('/').pop()
        const category = mockCategoriesStore.find((c) => String(c.id) === id)
        if (category) {
          mockData = { response: category }
        }
      }
      // Transactions
      else if (fullUrl.includes('/api/transactions/') && !fullUrl.endsWith('/api/transactions')) {
        const id = fullUrl.split('/').pop()
        const transaction = mockTransactionsStore.find((t) => String(t.id) === id)
        if (transaction) {
          mockData = { response: transaction }
        }
      } else if (fullUrl.includes('/api/transactions')) {
        const urlObj = new URL(fullUrl, 'http://localhost')
        const params = config.params || {}

        const limitParam = params.limit || urlObj.searchParams.get('limit')
        const pageParam = params.page || urlObj.searchParams.get('page')
        const sizeParam = params.size || urlObj.searchParams.get('size')
        const monthParam = params.month || urlObj.searchParams.get('month')
        const yearParam = params.year || urlObj.searchParams.get('year')

        // Sort by date descending (latest first)
        let filteredTransactions = [...mockTransactionsStore].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )

        // Apply filters
        if (yearParam && monthParam) {
          const filterPrefix = `${yearParam}-${String(monthParam).padStart(2, '0')}`
          filteredTransactions = filteredTransactions.filter((t) => t.date.startsWith(filterPrefix))
        } else if (yearParam) {
          filteredTransactions = filteredTransactions.filter((t) => t.date.startsWith(yearParam))
        } else if (monthParam) {
          filteredTransactions = filteredTransactions.filter((t) => {
            const [, m] = t.date.split('-')
            return m === String(monthParam).padStart(2, '0')
          })
        }

        // Calculate summary for the filtered period
        const income = filteredTransactions
          .filter((t) => t.type === 'INCOME')
          .reduce((sum, t) => sum + t.amount, 0)

        const expense = filteredTransactions
          .filter((t) => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + t.amount, 0)

        const summary = { income, expense }

        if (limitParam === '5') {
          mockData = { response: filteredTransactions.slice(0, 5) }
        } else if (pageParam || sizeParam) {
          const page = parseInt(pageParam || '1')
          const size = parseInt(sizeParam || '10')
          const start = (page - 1) * size
          const end = start + size
          mockData = {
            response: filteredTransactions.slice(start, end),
            pagination: {
              total: filteredTransactions.length,
              page,
              size,
              totalPages: Math.ceil(filteredTransactions.length / size),
            },
            summary,
          }
        } else {
          mockData = { response: filteredTransactions, summary }
        }
      }
      // Users
      else if (fullUrl.endsWith('/api/users')) {
        mockData = { response: mockUsersStore }
      } else if (fullUrl.includes('/api/users/') || fullUrl.includes('api/users/')) {
        // Handle both '/api/users/' and 'api/users/' (with/without leading slash)
        const userId = fullUrl.split('users/').pop()?.split('?')[0] // Remove query params if any

        // Check for known user IDs (UUIDs from JWT tokens) – use mutable profile for update support
        if (userId === ADMIN_ID) {
          mockData = { response: profileAdmin }
        } else if (userId === USER_ID) {
          mockData = { response: profileUser }
        } else {
          // Try to find in mockUsersStore by numeric ID
          const user = mockUsersStore.find((u) => String(u.id) === userId)
          if (user) {
            mockData = {
              response: {
                id: userId,
                email: user.email,
                name: user.username,
                role: user.role,
              },
            }
          } else {
            // If not found, return a default user profile based on email pattern
            // This handles cases where UUID is used but not in our mock data
            const emailMatch = userId.match(/^[a-f0-9-]{36}$/i) // UUID pattern
            if (emailMatch) {
              // Return a generic user profile for unknown UUIDs
              mockData = {
                response: {
                  id: userId,
                  email: 'user@example.com',
                  name: 'User',
                  role: 'USER',
                },
              }
            }
          }
        }
      }
      // Dashboard
      else if (fullUrl.endsWith('/api/dashboard/summary')) {
        mockData = { response: mockSummary }
      } else if (fullUrl.endsWith('/api/dashboard/breakdown')) {
        mockData = { response: mockFinancialBreakdown }
      }
      // Budgets
      else if (fullUrl.includes('/api/budgets/') && !fullUrl.endsWith('/api/budgets')) {
        const id = fullUrl.split('/').pop()
        const budget = mockBudgetsStore.find((b) => String(b.id) === id)
        if (budget) mockData = { response: budget }
      } else if (fullUrl.includes('/api/budgets')) {
        const urlObj = new URL(fullUrl, 'http://localhost')
        const params = config.params || {}
        const monthParam = params.month || urlObj.searchParams.get('month')
        const yearParam = params.year || urlObj.searchParams.get('year')
        let list = mockBudgetsStore
        if (monthParam) list = list.filter((b) => b.month === String(monthParam).padStart(2, '0'))
        if (yearParam) list = list.filter((b) => b.year === String(yearParam))
        mockData = { response: list }
      }
    }

    // ========== POST REQUESTS ==========
    else if (method === 'post') {
      if (fullUrl.includes('/api/transactions')) {
        const newTransaction = {
          id: Math.max(...mockTransactionsStore.map((t) => t.id), 0) + 1,
          ...config.data,
          date: config.data.date || new Date().toISOString().split('T')[0],
        }
        mockTransactionsStore.push(newTransaction)
        mockData = { response: newTransaction, message: 'Transaction created successfully' }
      } else if (fullUrl.includes('/api/categories')) {
        const newCategory = {
          id: Math.max(...mockCategoriesStore.map((c) => c.id), 0) + 1,
          ...config.data,
        }
        mockCategoriesStore.push(newCategory)
        mockData = { response: newCategory, message: 'Category created successfully' }
      } else if (fullUrl.includes('/api/budgets')) {
        const newBudget = {
          id: Math.max(...mockBudgetsStore.map((b) => b.id), 0) + 1,
          categoryId: config.data.categoryId,
          categoryName: config.data.categoryName,
          amount: config.data.amount,
          month: String(config.data.month || new Date().getMonth() + 1).padStart(2, '0'),
          year: String(config.data.year || new Date().getFullYear()),
        }
        mockBudgetsStore.push(newBudget)
        mockData = { response: newBudget, message: 'Budget created successfully' }
      } else if (fullUrl.startsWith('/api/')) {
        mockData = { message: 'Mock success', response: {} }
      }
    }

    // ========== PUT REQUESTS ==========
    else if (method === 'put') {
      if (fullUrl.includes('/api/transactions/')) {
        const id = parseInt(fullUrl.split('/').pop() || '0')
        const index = mockTransactionsStore.findIndex((t) => t.id === id)
        if (index !== -1) {
          mockTransactionsStore[index] = { ...mockTransactionsStore[index], ...config.data }
          mockData = {
            response: mockTransactionsStore[index],
            message: 'Transaction updated successfully',
          }
        }
      } else if (fullUrl.includes('/api/categories/')) {
        const id = parseInt(fullUrl.split('/').pop() || '0')
        const index = mockCategoriesStore.findIndex((c) => c.id === id)
        if (index !== -1) {
          mockCategoriesStore[index] = { ...mockCategoriesStore[index], ...config.data }
          mockData = {
            response: mockCategoriesStore[index],
            message: 'Category updated successfully',
          }
        }
      } else if (fullUrl.includes('/api/users/') || fullUrl.includes('api/users/')) {
        const userId = fullUrl.split('users/').pop()?.split('?')[0]
        if (userId === ADMIN_ID) {
          if (config.data.name !== undefined) profileAdmin.name = config.data.name
          if (config.data.email !== undefined) profileAdmin.email = config.data.email
          mockData = { response: profileAdmin, message: 'Profile updated successfully' }
        } else if (userId === USER_ID) {
          if (config.data.name !== undefined) profileUser.name = config.data.name
          if (config.data.email !== undefined) profileUser.email = config.data.email
          mockData = { response: profileUser, message: 'Profile updated successfully' }
        } else {
          const id = parseInt(userId || '0')
          const index = mockUsersStore.findIndex((u) => u.id === id)
          if (index !== -1) {
            mockUsersStore[index] = { ...mockUsersStore[index], ...config.data }
            mockData = { response: mockUsersStore[index], message: 'User updated successfully' }
          }
        }
      } else if (fullUrl.includes('/api/budgets/')) {
        const id = parseInt(fullUrl.split('/').pop() || '0')
        const index = mockBudgetsStore.findIndex((b) => b.id === id)
        if (index !== -1) {
          mockBudgetsStore[index] = { ...mockBudgetsStore[index], ...config.data }
          mockData = { response: mockBudgetsStore[index], message: 'Budget updated successfully' }
        }
      } else if (fullUrl.startsWith('/api/')) {
        mockData = { message: 'Mock success', response: {} }
      }
    }

    // ========== DELETE REQUESTS ==========
    else if (method === 'delete') {
      if (fullUrl.includes('/api/transactions/')) {
        const id = parseInt(fullUrl.split('/').pop() || '0')
        mockTransactionsStore = mockTransactionsStore.filter((t) => t.id !== id)
        mockData = { message: 'Transaction deleted successfully', response: {} }
      } else if (fullUrl.includes('/api/categories/')) {
        const id = parseInt(fullUrl.split('/').pop() || '0')
        mockCategoriesStore = mockCategoriesStore.filter((c) => c.id !== id)
        mockData = { message: 'Category deleted successfully', response: {} }
      } else if (fullUrl.includes('/api/users/')) {
        const id = parseInt(fullUrl.split('/').pop() || '0')
        mockUsersStore = mockUsersStore.filter((u) => u.id !== id)
        mockData = { message: 'User deleted successfully', response: {} }
      } else if (fullUrl.includes('/api/budgets/')) {
        const id = parseInt(fullUrl.split('/').pop() || '0')
        mockBudgetsStore = mockBudgetsStore.filter((b) => b.id !== id)
        mockData = { message: 'Budget deleted successfully', response: {} }
      } else if (fullUrl.startsWith('/api/')) {
        mockData = { message: 'Mock success', response: {} }
      }
    }

    if (mockData) {
      console.warn(`[Mock API Hit] ${method?.toUpperCase()} ${fullUrl} -> returning mock data`)
      config.adapter = async () => {
        return {
          data: mockData,
          status: 200,
          statusText: 'OK',
          headers: config.headers,
          config,
        }
      }
    } else if (!mockData && fullUrl.startsWith('/auth/') && method !== 'post') {
      // Handle unsupported methods for auth endpoints
      config.adapter = async () => {
        return Promise.reject({
          response: {
            status: 405,
            data: {
              status: 405,
              message: `Request method '${method?.toUpperCase()}' is not supported`,
            },
          },
        })
      }
    } else if (!mockData && fullUrl.startsWith('/api/')) {
      // Handle unhandled API endpoints - return 404
      config.adapter = async () => {
        return Promise.reject({
          response: {
            status: 404,
            data: {
              status: 404,
              message: `Endpoint not found: ${fullUrl}`,
            },
          },
        })
      }
    }

    return config
  })
}
