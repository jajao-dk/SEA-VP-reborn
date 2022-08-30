<script setup>
import { toRef } from 'vue';

const props = defineProps({
  menu: { type: Object, default () { return {} } }
})
</script>

<template>
  <router-link
    v-if="props.menu.meta.isEnabled"
    class="px-4 py-2 hover:bg-gray-200 cursor-pointer"
    :to="props.menu.path"
  >
    {{ props.menu.meta.title }}
  </router-link>
  <div
    v-else
    class="px-4 py-2 hover:bg-gray-200 cursor-not-allowed flex justify-between"
  >
    <div>
      {{ props.menu.meta.title }}
    </div>
    <div>
      <font-awesome-icon :icon="['fas', 'lock']" />
    </div>
  </div>
</template>
