<template>
  <div class="space-y-6">
    <!-- Header & Filter -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <!-- Month Dropdown -->
        <div class="relative flex-grow sm:flex-grow-0 group">
          <select
            v-model="selectedMonth"
            class="appearance-none pl-4 pr-10 py-2.5 w-full sm:w-44 rounded-2xl border border-gray-200 bg-white shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-800 dark:text-white text-sm font-bold cursor-pointer hover:border-blue-300 dark:hover:border-blue-700"
            @change="handleFilterChange"
          >
            <option
              v-for="(month, index) in months"
              :key="index"
              :value="String(index + 1).padStart(2, '0')"
            >
              {{ month }}
            </option>
          </select>
          <ChevronDown
            class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors"
            :size="18"
          />
        </div>

        <!-- Year Dropdown -->
        <div class="relative flex-grow sm:flex-grow-0 group">
          <select
            v-model="selectedYear"
            class="appearance-none pl-4 pr-10 py-2.5 w-full sm:w-32 rounded-2xl border border-gray-200 bg-white shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:bg-gray-900 dark:border-gray-800 dark:text-white text-sm font-bold cursor-pointer hover:border-blue-300 dark:hover:border-blue-700"
            @change="handleFilterChange"
          >
            <option v-for="year in years" :key="year" :value="String(year)">
              {{ year }}
            </option>
          </select>
          <ChevronDown
            class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors"
            :size="18"
          />
        </div>
      </div>
    </div>

    <!-- Monthly Summary -->
    <div class="grid grid-cols-2 gap-4">
      <div
        class="p-4 bg-green-50 rounded-2xl border border-green-100 dark:bg-green-900/10 dark:border-green-900/20"
      >
        <p class="text-xs text-green-600 dark:text-green-400 font-medium">Monthly Income</p>
        <p class="text-lg font-bold text-green-700 dark:text-green-300">
          Rp {{ formatNumber(monthlyIncome) }}
        </p>
      </div>
      <div
        class="p-4 bg-red-50 rounded-2xl border border-red-100 dark:bg-red-900/10 dark:border-red-900/20"
      >
        <p class="text-xs text-red-600 dark:text-red-400 font-medium">Monthly Expense</p>
        <p class="text-lg font-bold text-red-700 dark:text-red-300">
          Rp {{ formatNumber(monthlyExpense) }}
        </p>
      </div>
    </div>

    <!-- Transactions List -->
    <div class="space-y-3 pb-10">
      <div v-if="transactionStore.loading" class="flex flex-col items-center justify-center py-20">
        <div
          class="h-10 w-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin dark:border-gray-800"
        ></div>
        <p class="mt-4 text-gray-500 dark:text-gray-400">Loading transactions...</p>
      </div>

      <template v-else-if="transactionStore.transactions.length > 0">
        <div
          v-for="t in transactionStore.transactions"
          :key="t.id"
          class="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 transition-all hover:border-blue-100 dark:hover:border-blue-900/30 cursor-pointer active:scale-[0.98]"
          @click="openDetails(t)"
        >
          <div class="flex items-center gap-3">
            <div
              :class="
                t.type === 'INCOME'
                  ? 'bg-green-50 text-green-600 dark:bg-green-900/20'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20'
              "
              class="p-2.5 rounded-xl transition-colors"
            >
              <component :is="t.type === 'INCOME' ? ArrowDownLeft : ArrowUpRight" :size="20" />
            </div>
            <div>
              <p class="font-bold text-gray-900 dark:text-white leading-tight">
                {{ t.description }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ t.category }} • {{ formatDate(t.date) }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p
              :class="t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'"
              class="font-bold text-lg"
            >
              {{ t.type === 'INCOME' ? '+' : '-' }} {{ formatNumber(t.amount) }}
            </p>
          </div>
        </div>
      </template>

      <div
        v-else
        class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 dark:bg-gray-900 dark:border-gray-800"
      >
        <div class="p-4 bg-gray-50 rounded-full dark:bg-gray-800">
          <SearchX :size="40" class="text-gray-400" />
        </div>
        <h3 class="mt-4 font-bold text-gray-900 dark:text-white">No transactions found</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Try adjusting your monthly filter</p>
      </div>
    </div>

    <!-- Transaction Detail Drawer -->
    <TransactionDetailDrawer
      v-if="selectedTransaction"
      :is-open="isDrawerOpen"
      :transaction="selectedTransaction"
      @close="closeDrawer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore, type Transaction } from '@/stores/transaction'
import { ArrowDownLeft, ArrowUpRight, SearchX, ChevronDown } from 'lucide-vue-next'
import TransactionDetailDrawer from '@/components/transactions/TransactionDetailDrawer.vue'

const transactionStore = useTransactionStore()

// Drawer State
const isDrawerOpen = ref(false)
const selectedTransaction = ref<Transaction | null>(null)

const openDetails = (t: Transaction) => {
  selectedTransaction.value = t
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}

// Initialize with current month/year
const now = new Date()
const currentYear = now.getFullYear()
const selectedYear = ref(String(currentYear))
const selectedMonth = ref(String(now.getMonth() + 1).padStart(2, '0'))

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const years = computed(() => {
  const startYear = 2026
  const endYear = Math.max(2031, currentYear + 5)
  const list = []
  for (let y = startYear; y <= endYear; y++) {
    list.push(y)
  }
  return list
})

const monthlyIncome = computed(() => {
  return transactionStore.transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
})

const monthlyExpense = computed(() => {
  return transactionStore.transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)
})

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num)
}

const formatDate = (dateStr: string) => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return new Date(dateStr).toLocaleDateString('id-ID', options)
}

const handleFilterChange = () => {
  transactionStore.fetchTransactions({
    month: `${selectedYear.value}-${selectedMonth.value}`,
  })
}

onMounted(() => {
  handleFilterChange()
})
</script>
