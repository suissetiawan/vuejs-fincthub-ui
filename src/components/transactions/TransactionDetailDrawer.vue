<template>
  <Transition name="slide-up">
    <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close"></div>

      <!-- Drawer Content -->
      <div
        class="relative w-full max-w-lg bg-white dark:bg-gray-950 rounded-t-[2.5rem] sm:rounded-3xl p-6 shadow-2xl transition-all h-[85vh] sm:h-auto overflow-y-auto"
      >
        <!-- Handle for mobile -->
        <div
          class="mx-auto w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mb-6 sm:hidden"
        ></div>

        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ isEditing ? 'Edit Transaction' : 'Transaction Details' }}
          </h2>
          <button
            @click="close"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X :size="24" />
          </button>
        </div>

        <div v-if="!isEditing" class="space-y-8">
          <!-- View Mode -->
          <div class="flex flex-col items-center py-4">
            <div
              :class="
                transaction.type === 'INCOME'
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                  : 'bg-red-100 text-red-600 dark:bg-red-900/30'
              "
              class="p-4 rounded-3xl mb-4"
            >
              <component
                :is="transaction.type === 'INCOME' ? ArrowDownLeft : ArrowUpRight"
                :size="40"
              />
            </div>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">
              {{ transaction.type === 'INCOME' ? '+' : '-' }} Rp
              {{ formatNumber(transaction.amount) }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400 font-medium mt-1">
              {{ transaction.description }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
              <p class="font-bold text-gray-900 dark:text-white">{{ transaction.category }}</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
              <p class="font-bold text-gray-900 dark:text-white">
                {{ formatDate(transaction.date) }}
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-3 pt-4">
            <button
              @click="isEditing = true"
              class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Edit2 :size="20" /> Edit Transaction
            </button>
            <button
              @click="confirmDelete"
              class="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 :size="20" /> Delete
            </button>
          </div>
        </div>

        <div v-else class="space-y-6">
          <!-- Edit Mode -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                >Description</label
              >
              <input
                v-model="editedForm.description"
                type="text"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white"
                placeholder="e.g. Lunch at Warteg"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                >Amount (Rp)</label
              >
              <input
                v-model.number="editedForm.amount"
                type="number"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white"
                placeholder="0"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                  >Type</label
                >
                <select
                  v-model="editedForm.type"
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white"
                >
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                  >Category</label
                >
                <input
                  v-model="editedForm.category"
                  type="text"
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white"
                  placeholder="Food, Salary, etc."
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                >Date</label
              >
              <input
                v-model="editedForm.date"
                type="date"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white"
              />
            </div>
          </div>

          <div class="flex flex-col gap-3 pt-6">
            <button
              @click="handleSave"
              class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-95"
            >
              Update Transaction
            </button>
            <button
              @click="isEditing = false"
              class="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, ArrowDownLeft, ArrowUpRight, Edit2, Trash2 } from 'lucide-vue-next'
import { useTransactionStore, type Transaction } from '@/stores/transaction'

const props = defineProps<{
  isOpen: boolean
  transaction: Transaction
}>()

const emit = defineEmits(['close'])
const transactionStore = useTransactionStore()

const isEditing = ref(false)
const editedForm = ref({ ...props.transaction })

watch(
  () => props.transaction,
  (newVal) => {
    editedForm.value = { ...newVal }
    isEditing.value = false
  },
)

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const close = () => {
  emit('close')
}

const handleSave = async () => {
  try {
    await transactionStore.updateTransaction(props.transaction.id, editedForm.value)
    close()
  } catch (error) {
    console.error('Update failed:', error)
  }
}

const confirmDelete = async () => {
  if (confirm('Are you sure you want to delete this transaction?')) {
    try {
      await transactionStore.deleteTransaction(props.transaction.id)
      close()
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}

@media (min-width: 640px) {
  .slide-up-enter-from,
  .slide-up-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }

  .slide-up-enter-to,
  .slide-up-leave-from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
