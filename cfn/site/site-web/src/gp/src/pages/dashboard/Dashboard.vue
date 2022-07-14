<script setup>
import WniHeader from './DashboardHeader.vue'
import WniDrawer from './DashboardDrawer.vue'
</script>

<template>
  <div class="h-screen flex flex-col">
    <wni-header />
    <div class="flex-1 relative">
      <router-view />
      <wni-drawer />
    </div>
  </div>
</template>
