<script setup>
import { watch } from 'vue'
import { useAuth } from './plugins/auth'
import { useStore } from './store/app'

const { isLoading } = useAuth()
const store = useStore()

watch(isLoading, value => store.setLoading(value))
</script>

<template>
  <router-view />
  <div
    v-if="store.loading"
    class="fixed inset-0 bg-gray-900 bg-opacity-50"
  >
    <div class="h-full flex justify-center">
      <div class="self-center">
        <div class="w-64 h-64 bg-white rounded-xl shadow-xl flex justify-center">
          <div class="self-center">
            <font-awesome-icon
              class="text-gray-500 animate-spin"
              :icon="['fas', 'spinner']"
              size="4x"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
