import { defineStore } from 'pinia'
import api from '@/services/api'
import { useUiStore } from './ui'

export interface Transaction {
  id: number
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
}

interface TransactionState {
  transactions: Transaction[]
  loading: boolean
}

export const useTransactionStore = defineStore('transaction', {
  state: (): TransactionState => ({
    transactions: [],
    loading: false,
  }),
  actions: {
    async fetchTransactions(params?: { month?: string }) {
      const uiStore = useUiStore()
      this.loading = true
      // We don't show the global overlay for this, but could if needed
      try {
        const response = await api.get('/api/transactions', { params })
        this.transactions = response.data.response || []
      } catch (error) {
        console.error('Fetch transactions failed:', error)
      } finally {
        this.loading = false
      }
    },
    async createTransaction(data: any) {
      const uiStore = useUiStore()
      uiStore.setLoading(true, 'Saving transaction...')
      try {
        const response = await api.post('/api/transactions', data)
        await this.fetchTransactions() // Refresh list
        return response.data
      } catch (error) {
        throw error
      } finally {
        uiStore.setLoading(false)
      }
    },
    async deleteTransaction(id: number) {
      const uiStore = useUiStore()
      uiStore.setLoading(true, 'Deleting...')
      try {
        await api.delete(`/api/transactions/${id}`)
        this.transactions = this.transactions.filter((t) => t.id !== id)
      } catch (error) {
        throw error
      } finally {
        uiStore.setLoading(false)
      }
    },
    async updateTransaction(id: number, data: any) {
      const uiStore = useUiStore()
      uiStore.setLoading(true, 'Updating transaction...')
      try {
        await api.put(`/api/transactions/${id}`, data)
        await this.fetchTransactions()
      } catch (error) {
        throw error
      } finally {
        uiStore.setLoading(false)
      }
    },
  },
})
