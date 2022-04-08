<script setup>
import { useAuth } from '../plugins/auth'

const { login } = useAuth()
</script>

<template>
  <div class="container mx-auto">
    <div class="h-screen flex justify-center">
      <div class="self-center">
        <div class="flex flex-col gap-y-8 text-center">
          <div>
            <img
              src="/sailingship.svg"
              class="mx-auto h-40"
            >
          </div>
          <div class="text-gray-700 text-2xl">
            <div>SAFETY STATUS MONITORING</div>
            <div>Lite-version</div>	    
            <div>powered by Weathernews</div>
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
