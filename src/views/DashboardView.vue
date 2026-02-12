<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <span class="text-sm text-gray-500 dark:text-gray-400">{{ currentDate }}</span>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div
        class="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
            <h3 class="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
              Rp {{ formatNumber(summary.balance) }}
            </h3>
          </div>
          <div class="p-3 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-900/20">
            <Wallet :size="24" />
          </div>
        </div>
      </div>

      <div
        class="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Income</p>
            <h3 class="text-2xl font-bold mt-1 text-green-600">
              Rp {{ formatNumber(summary.income) }}
            </h3>
          </div>
          <div class="p-3 bg-green-50 text-green-600 rounded-xl dark:bg-green-900/20">
            <TrendingUp :size="24" />
          </div>
        </div>
      </div>

      <div
        class="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Expense</p>
            <h3 class="text-2xl font-bold mt-1 text-red-600">
              Rp {{ formatNumber(summary.expense) }}
            </h3>
          </div>
          <div class="p-3 bg-red-50 text-red-600 rounded-xl dark:bg-red-900/20">
            <TrendingDown :size="24" />
          </div>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div
      class="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800"
    >
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Financial Breakdown</h3>
      <div class="h-[300px] flex justify-center">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
        <router-link to="/transactions" class="text-sm text-blue-600 hover:underline"
          >View All</router-link
        >
      </div>
      <div class="space-y-3">
        <div
          v-for="t in recentTransactions"
          :key="t.id"
          class="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800"
        >
          <div class="flex items-center gap-3">
            <div
              :class="
                t.type === 'INCOME'
                  ? 'bg-green-50 text-green-600 dark:bg-green-900/20'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20'
              "
              class="p-2 rounded-lg"
            >
              <component :is="t.type === 'INCOME' ? ArrowDownLeft : ArrowUpRight" :size="20" />
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ t.description }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ t.category }} • {{ t.date }}
              </p>
            </div>
          </div>
          <p :class="t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'" class="font-bold">
            {{ t.type === 'INCOME' ? '+' : '-' }} {{ formatNumber(t.amount) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Wallet, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Title, Tooltip, Legend)

const currentDate = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

const summary = ref({
  balance: 4950000,
  income: 5000000,
  expense: 50000,
})

const recentTransactions = ref([
  {
    id: 1,
    description: 'Lunch at Warteg',
    category: 'Food',
    amount: 50000,
    type: 'EXPENSE',
    date: '2026-02-12',
  },
  {
    id: 2,
    description: 'Monthly Salary',
    category: 'Salary',
    amount: 5000000,
    type: 'INCOME',
    date: '2026-02-01',
  },
])

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num)
}

const chartData = {
  labels: ['Salary', 'Food', 'Transport', 'Entertainment', 'Rent'],
  datasets: [
    {
      data: [5000000, 450000, 200000, 150000, 1000000],
      backgroundColor: [
        '#10b981', // green (Salary)
        '#ef4444', // red (Food)
        '#f59e0b', // amber (Transport)
        '#8b5cf6', // violet (Entertainment)
        '#3b82f6', // blue (Rent)
      ],
      hoverOffset: 15,
      borderWidth: 0,
      cutout: '70%',
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 24,
        font: {
          family: 'Outfit',
          size: 11,
          weight: '500' as any,
        },
        color: '#64748b',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1e293b',
      bodyColor: '#1e293b',
      padding: 12,
      borderColor: '#e2e8f0',
      borderWidth: 1,
      displayColors: true,
      callbacks: {
        label: (context: any) => {
          const value = context.raw
          return ` Rp ${new Intl.NumberFormat('id-ID').format(value)}`
        },
      },
    },
  },
}
</script>
