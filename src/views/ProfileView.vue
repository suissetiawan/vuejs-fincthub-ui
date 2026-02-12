<template>
  <div class="space-y-6 max-w-2xl mx-auto">
    <!-- Profile Header -->
    <div class="text-center space-y-4">
      <div
        class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
      >
        <UserIcon :size="48" />
      </div>
      <div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white">
          {{ authStore.displayName }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400">{{ authStore.user?.email }}</p>
      </div>
    </div>

    <!-- Profile Details Card -->
    <div
      class="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm space-y-8"
    >
      <div class="grid gap-6 sm:grid-cols-2">
        <div class="space-y-1">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Username</p>
          <p class="text-lg font-bold text-gray-900 dark:text-white">
            {{ authStore.user?.username }}
          </p>
        </div>
        <div class="space-y-1">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Role</p>
          <div
            class="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-sm font-bold"
          >
            {{ authStore.user?.role }}
          </div>
        </div>
        <div class="space-y-1 col-span-full">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">User ID</p>
          <p class="text-lg font-mono text-gray-600 dark:text-gray-400">
            #{{ authStore.user?.id }}
          </p>
        </div>
      </div>

      <div class="pt-6 border-t border-gray-100 dark:border-gray-800">
        <button
          @click="handleLogout"
          class="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/10 dark:hover:bg-red-900/20 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <LogOut :size="20" /> Sign Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { User as UserIcon, LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/auth/login')
}
</script>
