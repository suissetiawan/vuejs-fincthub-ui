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

        <div v-if="detailLoading" class="space-y-8 animate-pulse">
          <!-- Skeleton View Mode -->
          <div class="flex flex-col items-center py-4">
            <div class="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-3xl mb-4"></div>
            <div class="w-48 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4"></div>
            <div class="w-32 h-6 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <div class="w-12 h-3 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
              <div class="w-24 h-5 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <div class="w-12 h-3 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
              <div class="w-24 h-5 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>

          <div class="flex flex-col gap-3 pt-4">
            <div class="w-full h-14 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
            <div class="w-full h-14 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
          </div>
        </div>

        <div v-else-if="!isEditing" class="space-y-8">
          <!-- View Mode -->
          <div v-if="detailTransaction" class="flex flex-col items-center py-4">
            <div
              :class="
                detailTransaction.type === 'INCOME'
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                  : 'bg-red-100 text-red-600 dark:bg-red-900/30'
              "
              class="p-4 rounded-3xl mb-4"
            >
              <component
                :is="detailTransaction.type === 'INCOME' ? ArrowDownLeft : ArrowUpRight"
                :size="40"
              />
            </div>
            <h3
              :class="getFontSizeClass(detailTransaction.amount, 'text-3xl')"
              class="font-black text-gray-900 dark:text-white transition-all"
            >
              {{ detailTransaction.type === 'INCOME' ? '+' : '-' }} Rp
              {{ formatNumber(detailTransaction.amount) }}
            </h3>
            <p
              :class="getTextFontSizeClass(detailTransaction.description, 'font-medium')"
              class="text-gray-500 dark:text-gray-400 mt-1 transition-all text-center"
            >
              {{ detailTransaction.description }}
            </p>
          </div>

          <div v-if="detailTransaction" class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</p>
              <p class="font-bold text-gray-900 dark:text-white">
                {{ detailTransaction.category }}
              </p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
              <p class="font-bold text-gray-900 dark:text-white">
                {{ formatDate(detailTransaction.date) }}
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
          <!-- Type Toggle -->
          <div class="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl">
            <button
              type="button"
              @click="editedForm.type = 'EXPENSE'"
              :class="
                editedForm.type === 'EXPENSE'
                  ? 'bg-white dark:bg-gray-800 shadow-sm text-red-600'
                  : 'text-gray-500'
              "
              class="flex-1 py-3 font-bold rounded-xl transition-all active:scale-95"
            >
              Expense
            </button>
            <button
              type="button"
              @click="editedForm.type = 'INCOME'"
              :class="
                editedForm.type === 'INCOME'
                  ? 'bg-white dark:bg-gray-800 shadow-sm text-green-600'
                  : 'text-gray-500'
              "
              class="flex-1 py-3 font-bold rounded-xl transition-all active:scale-95"
            >
              Income
            </button>
          </div>

          <div class="space-y-4">
            <!-- Amount -->
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                >Amount (Rp)</label
              >
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400"
                  >Rp</span
                >
                <input
                  v-model.number="editedForm.amount"
                  type="number"
                  class="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-xl font-black"
                  placeholder="0"
                />
              </div>
            </div>

            <!-- Description -->
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

            <div class="grid grid-cols-2 gap-4">
              <!-- Category Selection -->
              <div class="relative group">
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                  >Category</label
                >
                <select
                  v-model="editedForm.category"
                  class="appearance-none w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white cursor-pointer"
                >
                  <option value="" disabled>Select</option>
                  <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.name">
                    {{ cat.name }}
                  </option>
                </select>
                <ChevronDown
                  class="absolute right-3 top-[3.2rem] -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors"
                  :size="18"
                />
              </div>

              <!-- Date Selection -->
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
          </div>

          <div class="flex flex-col gap-3 pt-6">
            <button
              @click="handleSave"
              :disabled="loading"
              class="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Loader2 v-if="loading" class="animate-spin" :size="20" />
              <template v-else>Update Transaction</template>
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
import { ref, watch, onMounted } from 'vue'
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Trash2,
  ChevronDown,
  Loader2,
} from 'lucide-vue-next'
import { useTransactionStore, type Transaction } from '@/stores/transaction'
import { useCategoryStore } from '@/stores/category'
import { getFontSizeClass, getTextFontSizeClass } from '@/utils/amountHelper'

const props = defineProps<{
  isOpen: boolean
  transaction: Transaction
}>()

const emit = defineEmits(['close'])
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()

const isEditing = ref(false)
const loading = ref(false)
const detailLoading = ref(false)
const detailTransaction = ref<Transaction | null>(null)
const editedForm = ref({ ...props.transaction })

const getFormattedDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

watch(isEditing, (newVal) => {
  if (newVal && detailTransaction.value) {
    editedForm.value = {
      ...detailTransaction.value,
      date: getFormattedDate(detailTransaction.value.date),
    }
  }
})

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      isEditing.value = false
      detailLoading.value = true
      try {
        const data = await transactionStore.getTransactionById(props.transaction.id)
        detailTransaction.value = data
        // Prep for edit mode
        editedForm.value = {
          ...data,
          date: getFormattedDate(data.date),
        }
      } catch (error) {
        console.error('Failed to fetch transaction details:', error)
        detailTransaction.value = props.transaction // Fallback to prop data
      } finally {
        detailLoading.value = false
      }

      if (categoryStore.categories.length === 0) {
        categoryStore.fetchCategories()
      }
    }
  },
  { immediate: true },
)

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const close = () => {
  emit('close')
}

const handleSave = async () => {
  loading.value = true
  try {
    await transactionStore.updateTransaction(props.transaction.id, editedForm.value)
    close()
  } catch (error) {
    console.error('Update failed:', error)
  } finally {
    loading.value = false
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
onMounted(() => {
  if (categoryStore.categories.length === 0) {
    categoryStore.fetchCategories()
  }
})
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
