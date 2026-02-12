<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 lg:hidden"
  >
    <div class="flex items-center justify-around h-16">
      <router-link
        to="/"
        class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-primary dark:text-gray-400"
        active-class="text-blue-600 dark:text-blue-500"
      >
        <LayoutDashboard :size="20" />
        <span class="text-xs mt-1">Home</span>
      </router-link>

      <router-link
        to="/transactions"
        class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-primary dark:text-gray-400"
        active-class="text-blue-600 dark:text-blue-500"
      >
        <History :size="20" />
        <span class="text-xs mt-1">History</span>
      </router-link>

      <!-- FAB in Center -->
      <div class="relative -mt-8">
        <button
          @click="$emit('add-transaction')"
          class="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-transform"
        >
          <Plus :size="28" />
        </button>
      </div>

      <router-link
        v-if="authStore.isAdmin"
        to="/categories"
        class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-primary dark:text-gray-400"
        active-class="text-blue-600 dark:text-blue-500"
      >
        <Tags :size="20" />
        <span class="text-xs mt-1">Categories</span>
      </router-link>

      <router-link
        to="/profile"
        class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-primary dark:text-gray-400"
        active-class="text-blue-600 dark:text-blue-500"
      >
        <User :size="20" />
        <span class="text-xs mt-1">Profile</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { LayoutDashboard, History, Plus, Tags, User } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
defineEmits(['add-transaction'])
</script>
