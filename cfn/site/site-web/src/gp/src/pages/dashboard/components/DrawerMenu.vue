<script setup>
import { toRef } from 'vue';

const props = defineProps({
  menu: { type: Object, default () { return {} } }
})
</script>

<template>
  <router-link
    v-if="props.menu.meta.isEnabled"
    class="px-4 py-1 hover:bg-gray-300 cursor-pointer text-base text-gray-600"
    :to="props.menu.path"
  >
    {{ props.menu.meta.title }}
  </router-link>
  <div
    v-else
    class="px-4 py-1 hover:bg-gray-300 text-gray-600 cursor-not-allowed flex justify-between"
  >
    <div>
      {{ props.menu.meta.title }}
    </div>
    <div class=" justify-end">
      <font-awesome-icon :icon="['fas', 'lock']" size="xs"/>
    </div>
  </div>
</template>
