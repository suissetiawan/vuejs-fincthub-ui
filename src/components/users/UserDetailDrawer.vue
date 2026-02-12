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
            {{ isEditing ? (isNew ? 'Create User' : 'Edit User') : 'User Details' }}
          </h2>
          <button
            @click="close"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X :size="24" />
          </button>
        </div>

        <div v-if="!isEditing && user" class="space-y-8">
          <!-- View Mode -->
          <div class="flex flex-col items-center py-4">
            <div
              class="w-20 h-20 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mb-4"
            >
              <UserIcon :size="40" />
            </div>
            <h3 class="text-2xl font-black text-gray-900 dark:text-white">{{ user.username }}</h3>
            <p class="text-gray-500 dark:text-gray-400 font-medium">{{ user.email }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Role</p>
              <div
                class="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 text-xs font-bold"
              >
                {{ user.role }}
              </div>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">User ID</p>
              <p class="font-bold text-gray-900 dark:text-white">#{{ user.id }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-3 pt-4">
            <button
              @click="isEditing = true"
              class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Edit2 :size="20" /> Edit User
            </button>
            <button
              @click="confirmDelete"
              class="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 :size="20" /> Delete User
            </button>
          </div>
        </div>

        <div v-else class="space-y-6">
          <!-- Edit Mode -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                >Username</label
              >
              <input
                v-model="form.username"
                type="text"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white"
                placeholder="Ex: bambang"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                >Email Address</label
              >
              <input
                v-model="form.email"
                type="email"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white"
                placeholder="email@example.com"
              />
            </div>

            <div v-if="isNew">
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                >Password</label
              >
              <input
                v-model="form.password"
                type="password"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white"
                placeholder="********"
              />
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
                >User Role</label
              >
              <div class="flex gap-4">
                <button
                  type="button"
                  @click="form.role = 'USER'"
                  :class="
                    form.role === 'USER'
                      ? 'ring-2 ring-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-500'
                  "
                  class="flex-1 py-3 font-bold rounded-2xl transition-all"
                >
                  USER
                </button>
                <button
                  type="button"
                  @click="form.role = 'ADMIN'"
                  :class="
                    form.role === 'ADMIN'
                      ? 'ring-2 ring-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-500'
                  "
                  class="flex-1 py-3 font-bold rounded-2xl transition-all"
                >
                  ADMIN
                </button>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3 pt-6">
            <button
              @click="handleSave"
              :disabled="!isValid"
              class="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all active:scale-95"
            >
              {{ isNew ? 'Create User' : 'Update User' }}
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
import { X, Edit2, Trash2, User as UserIcon } from 'lucide-vue-next'
import { useUserStore, type User } from '@/stores/user'

const props = defineProps<{
  isOpen: boolean
  user: User | null
}>()

const emit = defineEmits(['close'])
const userStore = useUserStore()

const isEditing = ref(false)
const isNew = computed(() => !props.user?.id)
const form = ref({
  username: '',
  email: '',
  password: '',
  role: 'USER' as 'USER' | 'ADMIN',
})

const isValid = computed(() => {
  if (isNew.value) {
    return form.value.username && form.value.email && form.value.password
  }
  return form.value.username && form.value.email
})

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      if (props.user) {
        form.value = {
          username: props.user.username,
          email: props.user.email,
          password: '',
          role: props.user.role,
        }
        isEditing.value = false
      } else {
        form.value = { username: '', email: '', password: '', role: 'USER' }
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
      await userStore.createUser(form.value)
    } else if (props.user?.id) {
      await userStore.updateUser(props.user.id, {
        username: form.value.username,
        email: form.value.email,
        role: form.value.role,
      })
    }
    close()
  } catch (error) {
    console.error('Save user failed:', error)
  }
}

const confirmDelete = async () => {
  if (!props.user?.id) return

  if (confirm(`Are you sure you want to delete "${props.user.username}"?`)) {
    try {
      await userStore.deleteUser(props.user.id)
      close()
    } catch (error) {
      console.error('Delete user failed:', error)
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
