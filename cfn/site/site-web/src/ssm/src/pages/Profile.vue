<script setup>
import { useAuth } from '../plugins/auth'

const { user } = useAuth()
</script>

<template>
  <div class="container mx-auto mt-16">
    <div class="flex justify-center">
      <div class="flex gap-4">
        <div>
          <img
            class="h-24 rounded"
            :src="user.picture"
            :alt="user.name"
          >
        </div>
        <div class="flex flex-col gap-4">
          <div
            v-for="([key, val]) in Object.entries(user)"
            :key="key"
            class="max-w-3xl"
          >
            <div class="text-gray-700 font-bold text-sm uppercase">
              {{ key }}
            </div>
            <div class="text-gray-500 text-lg truncate">
              {{ val }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
