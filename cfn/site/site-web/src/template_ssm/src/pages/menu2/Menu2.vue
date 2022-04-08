<script setup>
import { useData } from './data'

const { data } = useData()
</script>

<template>
  <div>{{ data }}</div>
</template>
