<script setup>
import { watch } from 'vue'
import { useMap } from './map'

const { container, point } = useMap()

const emit = defineEmits(['change:point'])

watch(point, () => { emit('change:point', point.value) })
</script>

<template>
  <div
    ref="container"
    class="h-full"
  />
</template>
