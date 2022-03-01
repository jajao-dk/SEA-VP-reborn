<script setup>
import { useAuth } from '../plugins/auth'

const { login } = useAuth()
</script>

<template>
  <div class="container mx-auto">
    <div class="h-screen flex justify-center">
      <div class="self-center">
        <div class="flex flex-col gap-y-4 text-center">
          <div>
            <font-awesome-icon
              class="text-blue-500"
              size="10x"
              :icon="['fab', 'vuejs']"
            />
          </div>
          <div class="text-gray-700 text-2xl">
            Template Vue Application
          </div>
          <div>
            <button
              class="px-8 py-2 bg-blue-500 hover:bg-blue-700 rounded text-white text-xl"
              @click="login()"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
