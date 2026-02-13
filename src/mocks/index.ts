import { mockCategories } from './data/categories'
import { mockTransactions } from './data/transactions'
import { mockUsers, mockProfile } from './data/users'
import { mockSummary, mockFinancialBreakdown } from './data/dashboard'

export const setupMockInterceptor = (api: any) => {
  console.warn('[Mock API] System Initialized')

  api.interceptors.request.use(async (config: any) => {
    const fullUrl = config.url || ''
    const method = config.method?.toLowerCase()

    // Skip auth requests
    if (fullUrl.includes('/auth/')) {
      return config
    }

    console.warn(`[Mock API Request] ${method?.toUpperCase()} ${fullUrl}`)

    let mockData: any = null

    // Use includes for more flexible matching
    if (method === 'get') {
      if (fullUrl.endsWith('/api/categories')) {
        mockData = { response: mockCategories }
      } else if (fullUrl.includes('/api/categories/')) {
        const id = fullUrl.split('/').pop()
        mockData = {
          response: mockCategories.find((c) => String(c.id) === id) || mockCategories[0],
        }
      } else if (fullUrl.includes('/api/transactions/')) {
        const id = fullUrl.split('/').pop()
        mockData = {
          response: mockTransactions.find((t) => String(t.id) === id) || mockTransactions[0],
        }
      } else if (fullUrl.includes('/api/transactions')) {
        const urlObj = new URL(fullUrl, 'http://localhost') // dummy base for easy parsing
        const params = config.params || {}

        const limitParam = params.limit || urlObj.searchParams.get('limit')
        const pageParam = params.page || urlObj.searchParams.get('page')
        const sizeParam = params.size || urlObj.searchParams.get('size')
        const monthParam = params.month || urlObj.searchParams.get('month')
        const yearParam = params.year || urlObj.searchParams.get('year')

        // Sort by date descending (latest first)
        let filteredTransactions = [...mockTransactions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )

        // Apply filters
        if (yearParam && monthParam) {
          // Filter by specific YYYY-MM
          const filterPrefix = `${yearParam}-${monthParam}`
          filteredTransactions = filteredTransactions.filter((t) => t.date.startsWith(filterPrefix))
        } else if (yearParam) {
          // Filter by year only
          filteredTransactions = filteredTransactions.filter((t) => t.date.startsWith(yearParam))
        } else if (monthParam) {
          // Filter by month only (across any year - though less common usage)
          filteredTransactions = filteredTransactions.filter((t) => {
            const [, m] = t.date.split('-')
            return m === monthParam
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
          // Dashboard "recent" request
          mockData = { response: filteredTransactions.slice(0, 5) }
        } else if (pageParam || sizeParam) {
          // Pagination request
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
      } else if (fullUrl.endsWith('/api/users')) {
        mockData = { response: mockUsers }
      } else if (fullUrl.endsWith('/api/users/profile')) {
        mockData = { response: mockProfile }
      } else if (fullUrl.endsWith('/api/dashboard/summary')) {
        mockData = { response: mockSummary }
      } else if (fullUrl.endsWith('/api/dashboard/breakdown')) {
        mockData = { response: mockFinancialBreakdown }
      }
    } else if (['post', 'put', 'delete'].includes(method || '')) {
      // Mock success for all other API operations
      if (fullUrl.startsWith('/api/')) {
        mockData = { message: 'Mock success', response: {} }
      }
    }

    if (mockData) {
      console.warn(`[Mock API Hit] ${fullUrl} -> returning mock data`)
      // Use config.adapter to return mock data directly
      config.adapter = async () => {
        return {
          data: mockData,
          status: 200,
          statusText: 'OK',
          headers: config.headers,
          config,
        }
      }
    }

    return config
  })
}
