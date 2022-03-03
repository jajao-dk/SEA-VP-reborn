<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuth } from '../plugins/auth'
import * as QuickSightEmbedding from 'amazon-quicksight-embedding-sdk'
import {
  set as gtagSet,
  pageview as gtagPageview,
  optIn as gtagOptin,
  event as gtagEvent,
  customMap as gtagCustomMap,
} from 'vue-gtag'
const container = ref(null)

const { getToken, getUser } = useAuth()

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

  const user = await getUser()

    gtagOptin() // gtag.js にて、プラグイン登録時にプラグイン無効化しているので、ここで有効化する

    // GA4用の記述
    gtagSet('user_id', user.email)
    gtagSet('login_id', user.email)
    gtagSet('customer_id', user.customer_ids?.[0])

    // UA用の記述
    gtagCustomMap('dimension1', 'login_id')
    gtagCustomMap('dimension2', 'customer_id')
    gtagEvent('custom_dimension', { login_id: user.email, customer_id: user.customer_ids?.[0] })

    // pageview送信
    gtagPageview(location.href)
})
</script>

<template>
  <div 
    ref="container"
    class="h-full"
  />
</template>
