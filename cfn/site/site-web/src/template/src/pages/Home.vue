<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuth } from '../plugins/auth'
import * as QuickSightEmbedding from 'amazon-quicksight-embedding-sdk'

const container = ref(null)

const { getToken } = useAuth()

onMounted(async () => {
  const token = await getToken()
  const res = await axios.get('/api/v1/quicksight', { headers: { Authorization: `Bearer ${token}` } })

  const options = {
    url: res.data.EmbedUrl,
    container: container.value,
    iframeResizeOnSheetChange: true,
    printEnabled: true,
    scrolling: 'auto',
    width: '100%',
    height: '100%',
    locale: 'ja_JP'
  }
  QuickSightEmbedding.embedDashboard(options)
})
</script>

<template>
  <div
    ref="container"
    class="h-full"
  />
</template>
