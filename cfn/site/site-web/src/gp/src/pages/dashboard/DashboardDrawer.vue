<script setup>
import { useStore } from './store'

const store = useStore()
</script>

<template>
  <div
    class="absolute inset-y-0 w-72 z-50 bg-white shadow-2xl border-r-2 border-gray-200 transform duration-500 ease-in-out"
    :class="{ 'left-0': store.drawerOpen, '-left-72': !store.drawerOpen }"
  >
    <div class="flex flex-col text-lg text-gray-700">
      <router-link
        class="px-4 py-2 hover:bg-gray-200 cursor-pointer"
        to="/menu1"
      >
        1. LegXML Dashboard
      </router-link>
      <router-link
        class="px-4 py-2 hover:bg-gray-200 cursor-pointer"
        to="/menu2"
      >
        2. Vessel CII simulator
      </router-link>
      <router-link
        class="px-4 py-2 hover:bg-gray-200 cursor-pointer"
        to="/menu3"
      >
        3. TAP with CII
      </router-link>
      <router-link
        class="px-4 py-2 hover:bg-gray-200 cursor-pointer"
        to="/menu4"
      >
        4. ERRM with CII
      </router-link>
      <router-link
        class="px-4 py-2 hover:bg-gray-200 cursor-pointer"
        to="/menu5"
      >
        5. Voyage Comparison
      </router-link>
    </div>
  </div>
</template>
