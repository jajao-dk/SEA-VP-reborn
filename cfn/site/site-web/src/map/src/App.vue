<script setup>
import { ref, onMounted } from 'vue'
import { Map } from 'mapbox-gl'
import axios from 'axios'
import { useAuth } from './plugins/auth'

const { getToken, getUser } = useAuth()
const container = ref(null)

onMounted(async () => {
  const map = new Map({
    container: container.value,
    style: 'mapbox://styles/wni-with/ckvlpa1by14oq14nl44exkxwo',
    center: { lng: 139.4574888475846, lat: 35.57129105820117 },
    zoom: 7
  })

  const [, token] = await Promise.all([map.onPromise('load'), getToken()])

  const user = await getUser()
  console.log(user)
  const [cf, api] = await Promise.all([
    axios.get('/data/json/sample.json'),
    axios.get(`/customer/${user.customer_ids[0]}/json/sample.json`, { headers: { Authorization: `Bearer ${token}` } })
  ])
  console.log(cf.data)
  console.log(api.data)
})
</script>

<template>
  <div
    ref="container"
    class="h-screen"
  />
</template>
