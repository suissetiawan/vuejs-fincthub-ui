<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
      <button
        @click="openAddDrawer"
        class="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
      >
        <Plus :size="20" />
      </button>
    </div>

    <!-- Category List -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-if="categoryStore.loading && categoryStore.categories.length === 0"
        class="col-span-full py-20 flex flex-col items-center"
      >
        <div
          class="h-10 w-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin dark:border-gray-800"
        ></div>
        <p class="mt-4 text-gray-500 dark:text-gray-400">Loading categories...</p>
      </div>

      <template v-else-if="categoryStore.categories.length > 0">
        <div
          v-for="cat in categoryStore.categories"
          :key="cat.id"
          @click="openDetails(cat)"
          class="group p-5 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 dark:hover:border-blue-900/30 cursor-pointer active:scale-95"
        >
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <h3
                class="text-lg font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors"
              >
                {{ cat.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {{ cat.description || 'No description' }}
              </p>
            </div>
            <div
              class="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-colors"
            >
              <ChevronRight :size="18" />
            </div>
          </div>
        </div>
      </template>

      <!-- Empty State -->
      <div
        v-else
        class="col-span-full py-20 flex flex-col items-center bg-white dark:bg-gray-900 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800"
      >
        <div class="p-5 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
          <Tags :size="40" class="text-gray-400" />
        </div>
        <h3 class="font-bold text-gray-900 dark:text-white">No categories yet</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Start by adding your first category
        </p>
        <button
          @click="openAddDrawer"
          class="mt-6 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          Add Category
        </button>
      </div>
    </div>

    <!-- Category Detail Drawer -->
    <CategoryDetailDrawer
      :is-open="isDrawerOpen"
      :category="selectedCategory"
      @close="closeDrawer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, ChevronRight, Tags } from 'lucide-vue-next'
import { useCategoryStore, type Category } from '@/stores/category'
import CategoryDetailDrawer from '@/components/categories/CategoryDetailDrawer.vue'

const categoryStore = useCategoryStore()

const isDrawerOpen = ref(false)
const selectedCategory = ref<Category | null>(null)

const openAddDrawer = () => {
  selectedCategory.value = null
  isDrawerOpen.value = true
}

const openDetails = (cat: Category) => {
  selectedCategory.value = cat
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}

onMounted(() => {
  categoryStore.fetchCategories()
})
</script>
