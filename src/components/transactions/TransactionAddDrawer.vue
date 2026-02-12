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
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">New Transaction</h2>
          <button
            @click="close"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X :size="24" />
          </button>
        </div>

        <form @submit.prevent="handleSave" class="space-y-6">
          <!-- Type Toggle -->
          <div class="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl">
            <button
              type="button"
              @click="form.type = 'EXPENSE'"
              :class="
                form.type === 'EXPENSE'
                  ? 'bg-white dark:bg-gray-800 shadow-sm text-red-600'
                  : 'text-gray-500'
              "
              class="flex-1 py-3 font-bold rounded-xl transition-all active:scale-95"
            >
              Expense
            </button>
            <button
              type="button"
              @click="form.type = 'INCOME'"
              :class="
                form.type === 'INCOME'
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
                  v-model.number="form.amount"
                  type="number"
                  required
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
                v-model="form.description"
                type="text"
                required
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
                  v-model="form.category"
                  required
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
                  v-model="form.date"
                  type="date"
                  required
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white"
                />
              </div>
            </div>
          </div>

          <div class="pt-6">
            <button
              type="submit"
              :disabled="loading || !isValid"
              class="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus :size="24" /> Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { X, ChevronDown, Plus } from 'lucide-vue-next'
import { useTransactionStore } from '@/stores/transaction'
import { useCategoryStore } from '@/stores/category'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'success'])
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()

const loading = ref(false)

const getToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const form = ref({
  amount: 0,
  description: '',
  type: 'EXPENSE',
  category: '',
  date: getToday(),
})

const isValid = computed(() => {
  return form.value.amount > 0 && form.value.description && form.value.category && form.value.date
})

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      form.value = {
        amount: 0,
        description: '',
        type: 'EXPENSE',
        category: '',
        date: getToday(),
      }
      // Fetch categories if empty
      if (categoryStore.categories.length === 0) {
        categoryStore.fetchCategories()
      }
    }
  },
)

const close = () => {
  emit('close')
}

const handleSave = async () => {
  if (!isValid.value) return

  loading.value = true
  try {
    await transactionStore.createTransaction(form.value)
    emit('success')
    close()
  } catch (error) {
    console.error('Create transaction failed:', error)
  } finally {
    loading.value = false
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
