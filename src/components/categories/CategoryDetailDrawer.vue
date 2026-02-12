<template>
  <Transition name="slide-up">
    <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close"></div>

      <!-- Drawer Content -->
      <div
        class="relative w-full max-w-lg bg-white dark:bg-gray-950 rounded-t-[2.5rem] sm:rounded-3xl p-6 shadow-2xl transition-all h-[80vh] sm:h-auto overflow-y-auto"
      >
        <!-- Handle for mobile -->
        <div
          class="mx-auto w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mb-6 sm:hidden"
        ></div>

        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ isEditing ? (isNew ? 'New Category' : 'Edit Category') : 'Category Details' }}
          </h2>
          <button
            @click="close"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X :size="24" />
          </button>
        </div>

        <div v-if="!isEditing && category" class="space-y-8">
          <!-- View Mode -->
          <div class="space-y-6">
            <div class="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl">
              <p
                class="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-2"
              >
                Category Name
              </p>
              <p class="text-xl font-black text-gray-900 dark:text-white">{{ category.name }}</p>
            </div>

            <div class="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl">
              <p
                class="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-2"
              >
                Type
              </p>
              <p
                :class="category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'"
                class="text-lg font-black"
              >
                {{ category.type }}
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-3 pt-4">
            <button
              @click="isEditing = true"
              class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Edit2 :size="20" /> Edit Category
            </button>
            <button
              @click="confirmDelete"
              class="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 :size="20" /> Delete Category
            </button>
          </div>
        </div>

        <div v-else class="space-y-6">
          <!-- Edit Mode -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                >Category Name</label
              >
              <input
                v-model="form.name"
                type="text"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white"
                placeholder="e.g. Entertainment"
              />
            </div>

            <!-- Type Selection -->
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                >Type</label
              >
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
            </div>
          </div>

          <div class="flex flex-col gap-3 pt-6">
            <button
              @click="handleSave"
              :disabled="!form.name"
              class="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all active:scale-95"
            >
              {{ isNew ? 'Create Category' : 'Update Category' }}
            </button>
            <button
              @click="cancelEdit"
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
import { ref, watch, computed } from 'vue'
import { X, Edit2, Trash2 } from 'lucide-vue-next'
import { useCategoryStore, type Category } from '@/stores/category'

const props = defineProps<{
  isOpen: boolean
  category: Category | null
}>()

const emit = defineEmits(['close'])
const categoryStore = useCategoryStore()

const isEditing = ref(false)
const isNew = computed(() => !props.category?.id)
const form = ref({
  name: '',
  type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
})

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      if (props.category) {
        form.value = {
          name: props.category.name,
          type: props.category.type || 'EXPENSE',
        }
        isEditing.value = false
      } else {
        form.value = { name: '', type: 'EXPENSE' }
        isEditing.value = true
      }
    }
  },
)

const close = () => {
  emit('close')
}

const cancelEdit = () => {
  if (isNew.value) {
    close()
  } else {
    isEditing.value = false
  }
}

const handleSave = async () => {
  try {
    if (isNew.value) {
      await categoryStore.createCategory(form.value)
    } else if (props.category?.id) {
      await categoryStore.updateCategory(props.category.id, form.value)
    }
    close()
  } catch (error) {
    console.error('Save category failed:', error)
  }
}

const confirmDelete = async () => {
  if (!props.category?.id) return

  if (
    confirm(
      `Are you sure you want to delete "${props.category.name}"? This may affect transactions using this category.`,
    )
  ) {
    try {
      await categoryStore.deleteCategory(props.category.id)
      close()
    } catch (error) {
      console.error('Delete category failed:', error)
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
