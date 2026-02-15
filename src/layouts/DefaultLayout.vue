<template>
  <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
    <AppHeader />

    <main class="flex-grow pb-20 lg:pb-0">
      <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <router-view />
      </div>
    </main>

    <BottomNav @add-transaction="handleOpenAddModal" />

    <!-- Global Add Transaction Drawer -->
    <TransactionDetailDrawer
      :is-open="showAddDrawer"
      :transaction="null"
      @close="showAddDrawer = false"
    />

    <!-- Toast Notifications Placeholder -->
    <div id="toast-container" class="fixed top-4 right-4 z-[9999]"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import TransactionDetailDrawer from '@/components/transactions/TransactionDetailDrawer.vue'

const showAddDrawer = ref(false)

const handleOpenAddModal = () => {
  showAddDrawer.value = true
}
</script>
